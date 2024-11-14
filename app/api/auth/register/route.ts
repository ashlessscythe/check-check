import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Get or create default user role
    const defaultRole = await prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: {
        name: "user",
        permissions: {
          create: [
            { action: "check-in" },
            { action: "check-out" },
            { action: "view-own-history" },
          ],
        },
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      select: {
        id: true,
        email: true,
        roleId: true,
        role: {
          select: {
            name: true,
            permissions: {
              select: {
                action: true,
              },
            },
          },
        },
      },
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        permissions: user.role.permissions.map(
          (p: { action: string }) => p.action
        ),
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

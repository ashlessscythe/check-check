import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    roleId: string;
    role?: {
      name: string;
      permissions: { action: string }[];
    };
  };
}

export async function authMiddleware(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      roleId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Attach user to request for use in route handlers
    (req as AuthRequest).user = user;

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export function withAuth(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async function (req: NextRequest) {
    const response = await authMiddleware(req);

    if (response.status === 401) {
      return response;
    }

    return handler(req as AuthRequest);
  };
}

export function requirePermission(permission: string) {
  return function (handler: (req: AuthRequest) => Promise<NextResponse>) {
    return async function (req: AuthRequest) {
      const response = await authMiddleware(req);

      if (response.status === 401) {
        return response;
      }

      const user = (req as AuthRequest).user;
      const hasPermission = user?.role?.permissions.some(
        (p) => p.action === permission
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: "Permission denied" },
          { status: 403 }
        );
      }

      return handler(req as AuthRequest);
    };
  };
}

export function requireRole(roleName: string) {
  return function (handler: (req: AuthRequest) => Promise<NextResponse>) {
    return async function (req: AuthRequest) {
      const response = await authMiddleware(req);

      if (response.status === 401) {
        return response;
      }

      const user = (req as AuthRequest).user;
      if (user?.role?.name !== roleName) {
        return NextResponse.json(
          { error: "Role not authorized" },
          { status: 403 }
        );
      }

      return handler(req as AuthRequest);
    };
  };
}

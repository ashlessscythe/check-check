import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/api/auth/login", "/api/auth/register"];
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // If no token and not on public path, redirect to root
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };

    console.log(`Decoded Role: ${decoded.role}`);
    // Role-based routing
    const path = request.nextUrl.pathname;

    // Admin can access everything
    if (decoded.role === "ADMIN") {
      return NextResponse.next();
    }

    // Supervisor can access checklist and root
    if (decoded.role === "SUPERVISOR") {
      if (path === "/" || path === "/checklist") {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Regular users can only access root
    if (decoded.role === "USER") {
      if (path === "/") {
        return NextResponse.next();
      }
      // Redirect to root for any other path
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    // Invalid token, redirect to root
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/", "/checklist", "/dashboard", "/api/:path*"],
};

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
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
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

export function requireRole(role: UserRole) {
  return function (handler: (req: AuthRequest) => Promise<NextResponse>) {
    return async function (req: AuthRequest) {
      const response = await authMiddleware(req);

      if (response.status === 401) {
        return response;
      }

      const user = (req as AuthRequest).user;
      if (user?.role !== role) {
        return NextResponse.json(
          { error: "Role not authorized" },
          { status: 403 }
        );
      }

      return handler(req as AuthRequest);
    };
  };
}

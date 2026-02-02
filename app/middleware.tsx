import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet, JWTVerifyResult } from "jose";
import { config as appConfig } from "@/lib/config";

const JWKS = createRemoteJWKSet(new URL(appConfig.jwt.jwksUrl));

const ROLE_ROUTES: Record<string, string[]> = {
  admin: ["/admin"],
  medic: ["/medic"],
  pacient: ["/pacient"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/oauth")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // JWT verification
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: appConfig.jwt.issuer,
      audience: appConfig.jwt.audience,
    });

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = payload.role as string;
    const allowedRoutes = ROLE_ROUTES[userRole];

    if (
      allowedRoutes &&
      !allowedRoutes.some((route: string) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const middlewareConfig = {
  matcher: ["/admin/:path*", "/medic/:path*", "/pacient/:path*", "/profile/:path*"],
};

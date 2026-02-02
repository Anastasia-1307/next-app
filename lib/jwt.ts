import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";
import { config } from "./config";

const JWKS = createRemoteJWKSet(new URL(config.jwt.jwksUrl));

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
  return payload;
}

export type UserRole = "admin" | "medic" | "pacient";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  exp?: number;
}

export async function getAuthUser(token: string): Promise<AuthUser | null> {
  try {
    const payload = await verifyToken(token);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(exp?: number): boolean {
  if (!exp) return true;
  return exp * 1000 < Date.now();
}

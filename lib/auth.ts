import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, isTokenExpired } from "./jwt";
import { UserRole } from "./jwt";

export async function requireAuth(): Promise<{
  user: Awaited<ReturnType<typeof getAuthUser>>;
  token: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = await getAuthUser(token);
  if (!user || isTokenExpired(user.exp)) {
    redirect("/login");
  }

  return { user, token };
}

export async function requireRole(role: UserRole) {
  const { user } = await requireAuth();
  
  if (user.role !== role) {
    redirect("/unauthorized");
  }
  
  return user;
}

export function setAuthCookie(token: string) {
  return {
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 3600, // 1 hour
    path: "/",
  };
}

export function clearAuthCookie() {
  return {
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    expires: new Date(0),
    path: "/",
  };
}

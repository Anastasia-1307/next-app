import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, isTokenExpired } from "./jwt";
import { UserRole } from "./jwt";
import { getAuthToken } from "./cookie-utils";
import { refreshAccessToken, getRefreshToken, setRefreshToken } from "./refresh-token-server";

export async function requireAuth(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;
  token: string;
}> {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const user = await getAuthUser(token);
  if (!user || isTokenExpired(user.exp)) {
    // Încearcă refresh token
    console.log('🔒 Token expired, attempting refresh');
    const refreshToken = await getRefreshToken();
    
    if (refreshToken) {
      const tokenData = await refreshAccessToken();
      if (tokenData) {
        // Setează noul token în cookie
        const cookieStore = await cookies();
        cookieStore.set("auth_token", tokenData.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 3600, // 1 hour
          path: "/",
        });
        
        const newUser = await getAuthUser(tokenData.token);
        if (newUser) {
          return { user: newUser, token: tokenData.token };
        }
      }
    }
    
    redirect("/login");
  }

  return { user: user!, token };
}

export async function requireRole(role: UserRole) {
  console.log('🔒 requireRole: Checking for role:', role);
  
  const token = await getAuthToken();
  
  console.log('🔒 requireRole: Token found:', !!token);

  if (!token) {
    console.log('🔒 requireRole: No token - redirecting to login');
    redirect("/login");
  }

  // Fetch server-side pentru user info (ca în layout)
  console.log('🔒 requireRole: Fetching user info...');
  const res = await fetch("http://localhost:4000/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  console.log('🔒 requireRole: Response status:', res.status);

  if (!res.ok) {
    console.log('🔒 requireRole: Invalid response - redirecting to login');
    redirect("/login");
  }

  const userData = await res.json();
  console.log('🔒 requireRole: User data:', userData);

  if (userData.role !== role) {
    console.log('🔒 requireRole: Wrong role - redirecting to unauthorized');
    redirect("/unauthorized");
  }
  
  console.log('🔒 requireRole: Access granted');
  return userData;
}

export function setAuthCookie(token: string, refreshToken?: string) {
  const cookies = [];
  
  // Access token cookie
  cookies.push({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 3600, // 1 hour
    path: "/",
  });

  // Refresh token cookie (dacă este furnizat)
  if (refreshToken) {
    cookies.push({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 30 * 24 * 60 * 60, // 30 zile
      path: "/",
    });
  }

  return cookies;
}

export function clearAuthCookie() {
  return [
    {
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      expires: new Date(0),
      path: "/",
    },
    {
      name: "refresh_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      expires: new Date(0),
      path: "/",
    }
  ];
}

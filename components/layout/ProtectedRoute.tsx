import { ReactNode } from "react";
import { UserRole } from "@/lib/jwt";
import { requireRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  role: UserRole;
  fallback?: ReactNode;
}

export default async function ProtectedRoute({ 
  children, 
  role, 
  fallback 
}: ProtectedRouteProps) {
  try {
    await requireRole(role);
    return <>{children}</>;
  } catch {
    return fallback || <div>Access Denied</div>;
  }
}

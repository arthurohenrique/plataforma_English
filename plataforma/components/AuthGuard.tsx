"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePlatform } from "../store/PlatformContext";
import { platformRoutes } from "../routes";
import type { Role } from "../types";

export function AuthGuard({
  children,
  role,
  fallback,
}: {
  children: ReactNode;
  role: Role;
  fallback: ReactNode;
}) {
  const router = useRouter();
  const { ready, auth } = usePlatform();

  useEffect(() => {
    if (!ready) return;
    if (!auth) {
      router.replace(platformRoutes.login);
      return;
    }
    if (auth.role !== role) {
      router.replace(
        auth.role === "professor"
          ? platformRoutes.professor.home
          : platformRoutes.aluno.home,
      );
    }
  }, [ready, auth, role, router]);

  if (!ready || !auth || auth.role !== role) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

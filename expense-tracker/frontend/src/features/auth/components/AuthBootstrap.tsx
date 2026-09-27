"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth.api";
import { tokenStore } from "@/lib/auth/tokenStore";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
      const hasAccess = !!tokenStore.getAccessToken();
      const hasRefresh = !!tokenStore.getRefreshToken();

      try {
        if (!hasAccess && hasRefresh) {
          await authApi.refresh();
        }

        if (tokenStore.getAccessToken()) {
          const user = await authApi.me();
          queryClient.setQueryData(queryKeys.auth.me, user);
          if (isPublic) {
            router.replace("/dashboard");
          }
        } else if (!isPublic && pathname !== "/") {
          router.replace("/login");
        }
      } catch {
        tokenStore.clear();
        if (!isPublic && pathname !== "/") {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [pathname, queryClient, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}

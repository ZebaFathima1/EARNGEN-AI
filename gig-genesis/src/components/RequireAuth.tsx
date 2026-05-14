import { ReactNode, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { next: pathname } });
    }
  }, [user, loading, navigate, pathname]);

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

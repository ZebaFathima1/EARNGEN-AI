import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import logoUrl from "@/assets/logo.png";

const NAV_AUTH = [
  { to: "/speak-with-ai", label: "Speak with AI" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/network", label: "Network" },
  { to: "/learn", label: "Learn" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/sprint", label: "7-Day Sprint" },
  { to: "/income", label: "Income" },
  { to: "/proof", label: "Proof-of-Work" },
  { to: "/profile", label: "Profile" },
] as const;

export function Shell({ children, immersive }: { children?: ReactNode; immersive?: boolean }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const { user, profile, avatarUrl, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const initial = (profile?.full_name || user?.email || "?").charAt(0).toUpperCase();
  const homeHref = user ? "/speak-with-ai" : "/";

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground overflow-x-hidden">
      {!loading && !user && (
        <div className="bg-brand/10 text-brand text-xs text-center py-2 px-4 font-medium">
          Sign in to use AI (roadmap, sprint, and chat).{" "}
          <Link to="/auth" className="underline font-semibold">
            Sign in or create an account
          </Link>
        </div>
      )}
      <nav className="sticky top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            <Link to={homeHref} className="font-semibold tracking-tight text-base sm:text-lg text-brand inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
              <img src={logoUrl} alt="EARNGEN-AI logo" width={40} height={40} className="size-8 sm:size-10" />
              <span className="truncate max-w-[9rem] sm:max-w-none">
                EARNGEN<span className="text-foreground">-AI</span>
              </span>
            </Link>
            {user ? (
              <div className="hidden md:flex items-center gap-6">
                {NAV_AUTH.map((n) => {
                  const active = path === n.to || path.startsWith(n.to);
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={
                        "text-sm font-medium transition-colors " +
                        (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="size-8 rounded-full bg-gradient-to-br from-brand to-brand-light overflow-hidden grid place-items-center text-xs text-white font-semibold shrink-0">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" className="size-full object-cover" />
                      : initial}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground hidden md:inline">
                    {profile?.full_name || user.email}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:inline-flex text-xs font-semibold tracking-wide uppercase text-muted-foreground hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="hidden md:inline-flex rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex size-9 items-center justify-center rounded-lg ring-1 ring-border text-foreground"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="md:hidden border-t border-border bg-background max-h-[min(70dvh,520px)] overflow-y-auto overscroll-contain">
            <div className="px-3 sm:px-4 py-3 flex flex-col gap-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {user
                ? NAV_AUTH.map((n) => {
                    const active = path === n.to || path.startsWith(n.to);
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        onClick={() => setOpen(false)}
                        className={
                          "px-3 py-2 rounded-lg text-sm font-medium " +
                          (active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")
                        }
                      >
                        {n.label}
                      </Link>
                    );
                  })
                : null}
              <div className="border-t border-border my-2" />
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-left text-muted-foreground hover:bg-muted"
                >
                  Sign out ({profile?.full_name || user.email})
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-foreground text-background text-center"
                >
                  Sign in / Sign up
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </nav>

      <main
        className={
          immersive
            ? "min-h-[calc(100dvh-4rem)]"
            : "max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        }
      >
        {children ?? <Outlet />}
      </main>

      <footer className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 mt-6 sm:mt-12 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-[42ch]">
            <p className="text-sm font-semibold mb-2 inline-flex items-center gap-2">
              <img src={logoUrl} alt="" width={24} height={24} className="size-6" loading="lazy" />
              EARNGEN-AI
            </p>
            <p className="text-sm text-muted-foreground text-pretty">
              The income operating system for student earners. Verified skills. Verified results.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-12 text-sm w-full sm:w-auto">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
              {user ? (
                <>
                  <Link to="/speak-with-ai" className="block text-muted-foreground hover:text-foreground">
                    Speak with AI
                  </Link>
                  <Link to="/network" className="block text-muted-foreground hover:text-foreground">
                    Network Hub
                  </Link>
                  <Link to="/opportunities" className="block text-muted-foreground hover:text-foreground">
                    Opportunities
                  </Link>
                  <Link to="/sprint" className="block text-muted-foreground hover:text-foreground">
                    7-Day Sprint
                  </Link>
                  <Link to="/proof" className="block text-muted-foreground hover:text-foreground">
                    Proof-of-Work
                  </Link>
                </>
              ) : (
                <Link to="/auth" className="block text-muted-foreground hover:text-foreground">
                  Sign in to explore
                </Link>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
              {user ? (
                <button onClick={handleSignOut} className="block text-muted-foreground hover:text-foreground">
                  Sign out
                </button>
              ) : (
                <Link to="/auth" className="block text-muted-foreground hover:text-foreground">
                  Sign in / Sign up
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"rounded-2xl bg-card ring-1 ring-border " + className}>{children}</div>;
}

export function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className={
        "p-4 sm:p-6 rounded-2xl ring-1 " + (accent ? "bg-foreground text-background ring-foreground" : "bg-card ring-border")
      }
    >
      <p className={"text-xs font-medium mb-2 " + (accent ? "text-background/70" : "text-muted-foreground")}>{label}</p>
      <p className="text-2xl sm:text-3xl font-semibold tracking-tight truncate">{value}</p>
      {sub ? <p className={"text-xs font-medium mt-2 " + (accent ? "text-brand-light" : "text-brand")}>{sub}</p> : null}
    </div>
  );
}

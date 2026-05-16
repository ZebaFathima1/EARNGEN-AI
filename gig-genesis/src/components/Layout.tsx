import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import logoUrl from "@/assets/logo.png";

const NAV_AUTH = [
  { to: "/speak-with-ai", label: "Speak with AI" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/sprint", label: "7-Day Sprint" },
  { to: "/income", label: "Income" },
  { to: "/proof", label: "Proof-of-Work" },
  { to: "/profile", label: "Profile" },
] as const;

export function Shell({ children }: { children?: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const { user, profile, avatarUrl, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const initial = (profile?.name || user?.email || "?").charAt(0).toUpperCase();
  const homeHref = user ? "/speak-with-ai" : "/";

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!loading && !user && (
        <div className="bg-brand/10 text-brand text-xs text-center py-2 px-4 font-medium">
          Sign in to use AI (roadmap, sprint, and chat).{" "}
          <Link to="/auth" className="underline font-semibold">
            Sign in or create an account
          </Link>
        </div>
      )}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={homeHref} className="font-semibold tracking-tight text-lg text-brand inline-flex items-center gap-2">
              <img src={logoUrl} alt="EARNGEN-AI logo" width={40} height={40} className="size-10" />
              <span>
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
                    {profile?.name || user.email}
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
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 flex flex-col gap-1">
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
                  Sign out ({profile?.name || user.email})
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children ?? <Outlet />}</main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 mt-8 sm:mt-12 border-t border-border">
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
          <div className="flex gap-12 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
              {user ? (
                <>
                  <Link to="/speak-with-ai" className="block text-muted-foreground hover:text-foreground">
                    Speak with AI
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

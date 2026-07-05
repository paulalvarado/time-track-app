import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect } from "react";
import { Button, Card, CardLabel, Badge, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Dropdown, DropdownItem, DropdownDivider } from "../components/ui";
import { useDarkMode } from "../lib/use-dark-mode";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

function LogoSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Landing Page (not logged in) ─── */

function LandingPage() {
  return (
    <main className="min-h-screen bg-page flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-4">
          <LogoSvg />
          <span className="text-[22px] font-semibold tracking-[-0.44px] text-text-primary">Time Track</span>
        </div>
        <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
          Track your time with Odoo.
        </h1>
        <p className="mt-3 text-[14px] leading-[20px] text-text-secondary">
          Log, manage, and report your time entries. Integrated with Odoo for seamless project tracking.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/login">
            <Button variant="secondary" size="md">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button size="md">Get started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ─── Dashboard (logged in) ─── */

function DashboardPage({ user }: { user: { name: string; email: string } }) {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const confirmLogout = useDialog();
  const { isDark, toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    if (sessionStorage.getItem("welcome") === "true") {
      sessionStorage.removeItem("welcome");
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 2500);
    }
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    navigate({ to: "/login" });
  };

  const stats = [
    { label: "Total Projects", value: "0", icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" },
    { label: "Hours Tracked", value: "0h", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
    { label: "Odoo Connected", value: "No", icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" },
  ];

  return (
    <main className="min-h-screen bg-page">
      {/* Welcome toast */}
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-[8px] border border-border bg-card px-4 py-3 shadow-[0px_8px_24px_#0000001a] animate-[slideInRight_0.4s_ease-out]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info-bg">
            <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium leading-[18px] text-text-primary">Welcome, {user.name.split(" ")[0]}!</p>
            <p className="text-[12px] leading-[16px] text-text-muted">You are now signed in.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoSvg />
            <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/settings" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">
              Settings
            </Link>
            <Dropdown
              align="end"
              trigger={
                <div className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-[11px] font-medium text-text-secondary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] leading-[18px] text-text-secondary hidden sm:block">{user.name}</span>
                </div>
              }
            >
              <DropdownItem
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                }
                onClick={() => navigate({ to: "/settings" })}
              >
                Profile
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={isDark ? "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" : "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"} />
                  </svg>
                }
                onClick={toggleDark}
              >
                {isDark ? "Light mode" : "Dark mode"}
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                variant="danger"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                  </svg>
                }
                onClick={confirmLogout.show}
              >
                Sign out
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Welcome back, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            Here's an overview of your time tracking activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label} variant="default">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-surface">
                  <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">{s.value}</p>
                  <p className="text-[13px] leading-[18px] text-text-secondary">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary mb-4">
            Quick actions.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/settings" className="block no-underline group">
              <Card variant="soft">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-card border border-border group-hover:border-[#171717]/20 transition-colors">
                    <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium leading-[20px] text-text-primary group-hover:text-accent transition-colors">Connect Odoo</p>
                    <p className="text-[13px] leading-[18px] text-text-secondary">Configure your Odoo instance to sync projects.</p>
                  </div>
                  <span className="inline-flex h-8 items-center rounded-[6px] bg-[#171717] px-3 text-[13px] font-medium leading-[20px] text-[#ffffff] group-hover:bg-[#0070f3] transition-colors">
                    Configure
                  </span>
                </div>
              </Card>
            </Link>
            <Link to="/projects" className="block no-underline group">
              <Card variant="soft">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-card border border-border group-hover:border-[#171717]/20 transition-colors">
                    <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium leading-[20px] text-text-primary group-hover:text-accent transition-colors">View Projects</p>
                    <p className="text-[13px] leading-[18px] text-text-secondary">Browse and manage your synced projects.</p>
                  </div>
                  <span className="inline-flex h-8 items-center rounded-[6px] bg-[#171717] px-3 text-[13px] font-medium leading-[20px] text-[#ffffff] group-hover:bg-[#0070f3] transition-colors">
                    View
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary mb-4">
            Recent activity.
          </h2>
          <Card variant="default">
            <div className="text-center py-8">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-[14px] font-medium leading-[20px] text-text-primary">No activity yet</p>
              <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">Start by connecting your Odoo instance.</p>
              <Link to="/settings">
                <Button variant="primary" size="sm" className="mt-4">Connect Odoo</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Sign out confirmation dialog */}
      <Dialog open={confirmLogout.open} onClose={confirmLogout.close}>
        <DialogHeader
          title="Sign out"
          description="Are you sure you want to sign out? You'll need to log in again to access your dashboard."
          onClose={confirmLogout.close}
        />
        <DialogBody>
          Your session will be ended and you'll be redirected to the login page.
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={confirmLogout.close}>Cancel</Button>
          <Button variant="danger" size="md" onClick={handleLogout}>Sign out</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

/* ─── Home Page (routes based on auth) ─── */

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; hasOdooConfig: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const u = data.user;
        if (!u.hasOdooConfig) {
          navigate({ to: "/settings" });
          return;
        }
        setUser(u);
      })
      .catch(() => {
        // No autenticado, mostrar landing
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <main className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex items-center gap-2 text-[14px] text-text-muted">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </main>
    );
  }

  if (user) {
    return <DashboardPage user={user} />;
  }

  return <LandingPage />;
}

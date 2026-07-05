import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect, useRef } from "react";
import { Button, Dropdown, DropdownItem, DropdownDivider, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog } from "../components/ui";
import { useDarkMode } from "../lib/use-dark-mode";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: ProjectsPage,
});

type Project = {
  odooId: number;
  name: string;
  color?: number | null;
  isMine?: boolean;
  updatedAt?: string;
};

const ODOO_COLORS: Record<number, string> = {
  1: "#FF4444", 2: "#FF8C00", 3: "#FFD700", 4: "#87CEEB",
  5: "#6A0DAD", 6: "#FA8072", 7: "#4682B4", 8: "#00008B",
  9: "#FF00FF", 10: "#008000", 11: "#800080",
};

function getProjectColor(color?: number | null): string {
  if (color === null || color === undefined || color === 0) return "var(--c-border)";
  return ODOO_COLORS[color] || "var(--c-border)";
}

function LogoSvg({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProjectsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const confirmLogout = useDialog();
  const lastSyncRef = useRef<string | null>(null);
  const { isDark, toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    // Initial load of user + projects
    const loadInitial = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) throw new Error("Unauthorized");
        const userData = await userRes.json();
        setUser(userData.user);

        const projRes = await fetch("/api/sync/projects");
        if (!projRes.ok) throw new Error("Unauthorized");
        const projData = await projRes.json();
        setProjects(projData.projects || []);
        setSyncing(projData.syncing || false);
        if (projData.lastSyncAt) lastSyncRef.current = projData.lastSyncAt;
      } catch {
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    };
    loadInitial();

    // Poll every 10s for changes
    const interval = setInterval(async () => {
      try {
        const since = lastSyncRef.current ? `?since=${encodeURIComponent(lastSyncRef.current)}` : "";
        const res = await fetch(`/api/sync/projects${since}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.syncing !== undefined) setSyncing(data.syncing);
        if (data.lastSyncAt) lastSyncRef.current = data.lastSyncAt;

        if (data.changed && data.changed.length > 0) {
          setProjects(prev => {
            const map = new Map(prev.map(p => [p.odooId, p]));
            for (const c of data.changed) map.set(c.odooId, c);
            return [...map.values()].sort((a, b) => {
              if (a.isMine && !b.isMine) return -1;
              if (!a.isMine && b.isMine) return 1;
              return a.name.localeCompare(b.name);
            });
          });
        }
      } catch {}
    }, 10_000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-page">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <LogoSvg />
              <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/settings" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">
                Settings
              </Link>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1200px] px-6 py-20 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[14px] text-text-muted">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <LogoSvg />
            <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/settings" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">
              Settings
            </Link>
            {user && (
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
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
              Projects.
            </h1>
            <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
              {projects.length > 0
                ? `You have ${projects.length} project${projects.length === 1 ? "" : "s"} synced from Odoo.`
                : "No projects synced yet."}
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-[12px] border border-border bg-card p-12 text-center shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold leading-[24px] text-text-primary">No projects yet</h2>
            <p className="mt-1 text-[14px] leading-[20px] text-text-secondary max-w-sm mx-auto">
              Connect your Odoo instance and sync your projects to start tracking time.
            </p>
            <Link to="/settings">
              <Button size="md" className="mt-4">Connect Odoo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const projectColor = getProjectColor(project.color);
              return (
                <Link
                  key={project.odooId}
                  to="/projects/$projectId"
                  params={{ projectId: String(project.odooId) }}
                  className="rounded-[8px] border border-border bg-card hover:border-border-hover transition-colors shadow-[0px_1px_1px_#00000003,0px_2px_4px_-2px_#00000005] no-underline block"
                >
                  <div className="h-1.5 rounded-t-[8px]" style={{ backgroundColor: projectColor }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="mt-0.5 h-3 w-3 shrink-0 rounded-[2px]" style={{ backgroundColor: projectColor }} />
                      {project.isMine && (
                        <span className="shrink-0 rounded-[4px] bg-accent px-1.5 py-0.5 text-[10px] font-medium leading-[14px] text-white tracking-[-0.1px]">
                          Mine
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-medium leading-[20px] text-text-primary line-clamp-2">{project.name}</p>
                    <p className="mt-1 text-[12px] leading-[16px] text-text-muted">Odoo ID: {project.odooId}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Sign out confirmation dialog */}
      <Dialog open={confirmLogout.open} onClose={confirmLogout.close}>
        <DialogHeader
          title="Sign out"
          description="Are you sure you want to sign out?"
          onClose={confirmLogout.close}
        />
        <DialogBody>Your session will be ended.</DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={confirmLogout.close}>Cancel</Button>
          <Button variant="danger" size="md" onClick={handleLogout}>Sign out</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

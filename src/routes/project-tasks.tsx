import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect } from "react";
import { Button, Dropdown, DropdownItem, DropdownDivider, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, ScrollArea } from "../components/ui";
import { useCatalog, type CatalogItem } from "../lib/use-catalog";
import { useDarkMode } from "../lib/use-dark-mode";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  component: ProjectTasksPage,
});

type Task = {
  id: number;
  name: string;
  stageId: number | null;
  stageName: string;
  assignees: [number, string][];
  priority: string;
  deadline: string | null;
  color: number | null;
};

type Stage = {
  id: number;
  name: string;
};

const ODOO_COLORS: Record<number, string> = {
  1: "#FF4444", 2: "#FF8C00", 3: "#FFD700", 4: "#87CEEB",
  5: "#6A0DAD", 6: "#FA8072", 7: "#4682B4", 8: "#00008B",
  9: "#FF00FF", 10: "#008000", 11: "#800080",
};

const PRIORITY_COLORS: Record<string, string> = {
  "0": "#888888",
  "1": "#FF8C00",
  "2": "#FF4444",
  "3": "#ee0000",
};

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

function ProjectTasksPage() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [projectName, setProjectName] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const confirmLogout = useDialog();
  const { items: priorityItems } = useCatalog("priority");
  const { isDark, toggle: toggleDark } = useDarkMode();

  const getPriorityLabel = (key: string): string => {
    const found = priorityItems.find((i: CatalogItem) => i.key === key);
    return found?.value || key;
  };
  const getPriorityColor = (key: string): string => PRIORITY_COLORS[key] || "#888888";

  useEffect(() => {
    const match = window.location.pathname.match(/\/projects\/(\d+)/);
    if (match) setProjectId(match[1]);
  }, []);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = () => {
      Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/sync/projects/${projectId}/tasks`),
      ])
        .then(async ([userRes, tasksRes]) => {
          if (!userRes.ok) throw new Error("Unauthorized");
          const userData = await userRes.json();
          setUser(userData.user);

          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            setProjectName(tasksData.projectName || `Project #${projectId}`);
            setTasks(tasksData.tasks || []);
            setStages(tasksData.stages || []);
            setLastSyncAt(tasksData.lastSyncAt || null);
          } else {
            const errData = await tasksRes.json().catch(() => ({}));
            setFetchError(errData.error || "Could not load tasks");
            setProjectName(`Project #${projectId}`);
          }
        })
        .catch((err) => {
          if (err.message === "Unauthorized") {
            navigate({ to: "/login" });
          } else {
            setFetchError(err.message);
          }
        })
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, [navigate, projectId]);

  const handleLogout = () => { fetch("/api/auth/logout", { method: "POST" }).catch(() => {}); navigate({ to: "/login" }); };

  // Collapsed stages state (persisted in localStorage)
  const [collapsedStages, setCollapsedStages] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (!projectId) return;
    try {
      const saved = localStorage.getItem(`tt-collapsed-${projectId}`);
      if (saved) setCollapsedStages(new Set(JSON.parse(saved)));
    } catch {}
  }, [projectId]);

  const toggleStage = (stageId: number) => {
    setCollapsedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      if (projectId) localStorage.setItem(`tt-collapsed-${projectId}`, JSON.stringify([...next]));
      return next;
    });
  };

  // Group tasks by stage
  const tasksByStage = new Map<number, Task[]>();
  stages.forEach((s) => tasksByStage.set(s.id, []));
  tasksByStage.set(-1, []); // Uncategorized
  tasks.forEach((t) => {
    const bucket = tasksByStage.get(t.stageId ?? -1);
    if (bucket) bucket.push(t);
    else tasksByStage.get(-1)!.push(t);
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-page">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
            <Link to="/projects" className="flex items-center gap-2 no-underline">
              <LogoSvg />
              <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/settings" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">Settings</Link>
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
    <main className="min-h-screen max-h-screen overflow-hidden bg-page">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <Link to="/projects" className="flex items-center gap-2 no-underline">
            <LogoSvg />
            <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/settings" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">Settings</Link>
            {user && (
              <Dropdown align="end" trigger={
                <div className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-[11px] font-medium text-text-secondary">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="text-[13px] leading-[18px] text-text-secondary hidden sm:block">{user.name}</span>
                </div>
              }>
                <DropdownItem icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} onClick={() => navigate({ to: "/settings" })}>Settings</DropdownItem>
                <DropdownDivider />
                <DropdownItem icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={isDark ? "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" : "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"} /></svg>} onClick={toggleDark}>{isDark ? "Light mode" : "Dark mode"}</DropdownItem>
                <DropdownDivider />
                <DropdownItem variant="danger" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>} onClick={confirmLogout.show}>Sign out</DropdownItem>
              </Dropdown>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1200px] px-6 py-4">
        <Link to="/projects" className="text-[13px] leading-[18px] text-text-muted hover:text-text-primary no-underline">
          ← Projects
        </Link>
        <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary mt-1">
          {projectName}
        </h1>
        <p className="mt-0.5 text-[14px] leading-[20px] text-text-secondary">{tasks.length} task{tasks.length === 1 ? "" : "s"}</p>
      </div>

      {/* Kanban Board */}
      <div className="mx-auto max-w-[1200px] px-6 pb-8" style={{ height: "calc(100vh - 180px)" }}>
        <ScrollArea style={{ width: "100%", height: "100%" }} options={{ scrollbars: { autoHide: "never" } }}>
          <div className="flex gap-4 min-w-max h-full">
          {stages.length === 0 && tasks.length === 0 ? (
            <div className="w-full rounded-[12px] border border-border bg-card p-12 text-center">
              {fetchError ? (
                <>
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger-bg">
                    <svg className="h-5 w-5 text-danger-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium leading-[20px] text-danger-text">Could not load tasks</p>
                  <p className="mt-1 text-[13px] leading-[18px] text-text-muted">{fetchError}</p>
                </>
              ) : (
                <p className="text-[14px] leading-[20px] text-text-muted">No tasks found for this project.</p>
              )}
            </div>
          ) : (
            [...tasksByStage.entries()].map(([stageId, stageTasks]) => {
              const stage = stages.find((s) => s.id === stageId);
              if (!stage && stageId === -1 && stageTasks.length === 0) return null;
              return (
                <div key={stageId}
                  className={`shrink-0 h-full ${collapsedStages.has(stageId) ? 'w-10 overflow-hidden flex flex-col items-center justify-center cursor-pointer border border-border rounded-[8px]' : 'w-72 border border-border rounded-[8px] p-4 flex flex-col'}`}
                  onClick={collapsedStages.has(stageId) ? () => toggleStage(stageId) : undefined}>

                  {collapsedStages.has(stageId) ? (
                    <div className="select-none h-full flex items-center justify-center"
                      style={{ writingMode: "vertical-lr", textOrientation: "mixed" }}>
                      <span className="text-[13px] font-semibold leading-[18px] text-text-primary uppercase tracking-[-0.1px] whitespace-nowrap">
                        {stage?.name || "Uncategorized"} ({stageTasks.length})
                      </span>
                    </div>
                  ) : null}
                  {!collapsedStages.has(stageId) ? (
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="flex items-center justify-between mb-3 px-2.5 py-2 border border-border rounded-[8px] cursor-pointer bg-page" onClick={() => toggleStage(stageId)}>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-semibold leading-[18px] text-text-primary uppercase tracking-[-0.1px]">
                            {stage?.name || "Uncategorized"}
                          </h3>
                          <span className="text-[11px] leading-[16px] text-text-muted">{stageTasks.length}</span>
                        </div>
                        <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <ScrollArea className="flex-1 min-h-0" style={{ height: "auto" }}>
                        {stageTasks.map((task) => {
                      const taskColor = task.color ? (ODOO_COLORS[task.color] || "var(--c-border)") : "var(--c-border)";
                      const priorityLabel = getPriorityLabel(task.priority);
                      const priorityColor = getPriorityColor(task.priority);
                      return (
                        <Link
                          key={task.id}
                          to="/projects/$projectId/tasks/$taskId"
                          params={{ projectId, taskId: String(task.id) }}
                          className="rounded-[8px] border border-border bg-card shadow-[0px_1px_1px_#00000003,0px_2px_4px_-2px_#00000005] hover:border-border-hover transition-colors cursor-pointer no-underline block mb-3"
                        >
                          {/* Color bar */}
                          <div className="h-1 rounded-t-[8px]" style={{ backgroundColor: taskColor }} />
                          <div className="p-3 space-y-2">
                            <p className="text-[13px] font-medium leading-[18px] text-text-primary line-clamp-2">{task.name}</p>
                            <div className="flex items-center justify-between">
                              {task.assignees.length > 0 && task.assignees[0] && (
                                <div className="flex items-center gap-1">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[9px] font-medium text-text-secondary">
                                    {task.assignees[0][1]?.charAt(0).toUpperCase() || "?"}
                                  </div>
                                  <span className="text-[11px] leading-[16px] text-text-muted truncate max-w-[100px]">{task.assignees[0][1] || "Unassigned"}</span>
                                </div>
                              )}
                              <span className="text-[10px] leading-[14px] font-medium" style={{ color: priorityColor }}>{priorityLabel}</span>
                            </div>
                            {task.deadline && (
                              <p className="text-[11px] leading-[16px] text-text-muted">
                                📅 {new Date(task.deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </ScrollArea>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
        </ScrollArea>
      </div>

      {/* Sign out dialog */}
      <Dialog open={confirmLogout.open} onClose={confirmLogout.close}>
        <DialogHeader title="Sign out" description="Are you sure you want to sign out?" onClose={confirmLogout.close} />
        <DialogBody>Your session will be ended.</DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={confirmLogout.close}>Cancel</Button>
          <Button variant="danger" size="md" onClick={handleLogout}>Sign out</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

import { createRoute, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect } from "react";
import { Button, Dropdown, DropdownItem, DropdownDivider, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Input, Label, DatePicker, NumberInput, SelectMenu } from "../components/ui";
import { useCatalog, type CatalogItem } from "../lib/use-catalog";
import { useDarkMode } from "../lib/use-dark-mode";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId/tasks/$taskId",
  component: TaskDetailPage,
});

export const TimesheetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId/tasks/$taskId/timesheet",
  component: TaskDetailPage,
});

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

function TaskDetailPage() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [task, setTask] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTab: "description" | "timesheet" = useLocation().pathname.endsWith("/timesheet") ? "timesheet" : "description";
  const confirmLogout = useDialog();
  const editDialog = useDialog();
  const [selectedTs, setSelectedTs] = useState<any>(null);
  const [editDate, setEditDate] = useState("");
  const [editName, setEditName] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const { items: priorityItems } = useCatalog("priority");
  const { items: userItems } = useCatalog("users");
  const { isDark, toggle: toggleDark } = useDarkMode();

  const getPriorityLabel = (key: string): string => {
    const found = priorityItems.find((i: CatalogItem) => i.key === key);
    return found?.value || key;
  };
  const getPriorityColor = (key: string): string => PRIORITY_COLORS[key] || "#888888";

  useEffect(() => {
    const match = window.location.pathname.match(/\/projects\/(\d+)\/tasks\/(\d+)/);
    if (match) { setProjectId(match[1]); setTaskId(match[2]); }
  }, []);

  // activeTab se deriva directamente de la URL vía useRouter()

  useEffect(() => {
    if (!projectId || !taskId) return;

    const fetchData = () => {
      Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/sync/projects/${projectId}/tasks/${taskId}`),
        fetch(`/api/sync/projects/${projectId}/tasks/${taskId}/timesheets`),
      ])
        .then(async ([userRes, taskRes, tsRes]) => {
          if (!userRes.ok) throw new Error("Unauthorized");
          const userData = await userRes.json();
          const taskData = await taskRes.json();
          setUser(userData.user);
          setProjectName(taskData.projectName || `Project #${projectId}`);
          setTask(taskData.task || null);
          if (tsRes.ok) {
            const tsData = await tsRes.json();
            setTimesheets(tsData.timesheets || []);
          }
        })
        .catch((err) => {
          if (err.message === "Unauthorized") { navigate({ to: "/login" }); }
          else { setLoading(false); }
        })
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, [navigate, projectId, taskId]);

  const handleLogout = () => { fetch("/api/auth/logout", { method: "POST" }).catch(() => {}); navigate({ to: "/login" }); };

  const handleEditSave = async () => {
    if (!selectedTs) return;
    setSaving(true);
    setEditError("");
    setEditSuccess("");

    const body: Record<string, any> = {};
    if (editName !== selectedTs.name) body.name = editName;
    if (parseFloat(editHours || "0") !== selectedTs.hours) body.hours = parseFloat(editHours || "0");
    if (editDate !== (selectedTs.date?.split("T")[0] || "")) body.date = editDate;
    if (editUserId && editUserId !== String(selectedTs.userId ?? "")) body.userId = parseInt(editUserId);

    if (Object.keys(body).length === 0) {
      setEditError("No changes to save.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/timesheets/${selectedTs.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      editDialog.close();
      // Refrescar timesheets inmediatamente
      fetch(`/api/sync/projects/${projectId}/tasks/${taskId}/timesheets`)
        .then((res) => res.ok ? res.json() : null)
        .then((tsData) => { if (tsData) setTimesheets(tsData.timesheets || []); })
        .catch(() => {});
    } catch {
      setEditError("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-page">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
            <Link to="/projects" className="flex items-center gap-2 no-underline"><LogoSvg /><span className="text-[16px] font-semibold text-text-primary">Time Track</span></Link>
            <div className="flex items-center gap-3"><Link to="/settings" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">Settings</Link></div>
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
          <Link to="/projects" className="flex items-center gap-2 no-underline"><LogoSvg /><span className="text-[16px] font-semibold text-text-primary">Time Track</span></Link>
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
        <div className="flex items-center gap-2 text-[13px] leading-[18px] text-text-muted">
          <Link to="/projects" className="hover:text-text-primary no-underline text-inherit">Projects</Link>
          <span>/</span>
          <Link to="/projects/$projectId" params={{ projectId }} className="hover:text-text-primary no-underline text-inherit">{projectName}</Link>
          <span>/</span>
          <span className="text-text-secondary">Task: {task?.name ? (task.name.length > 20 ? task.name.substring(0, 20) + "..." : task.name) : `#${taskId}`}</span>
        </div>
      </div>

      {/* Task detail */}
      <div className="mx-auto max-w-[1200px] px-6 pb-8">
        {!task ? (
          <div className="rounded-[12px] border border-border bg-card p-12 text-center">
            <p className="text-[14px] leading-[20px] text-text-muted">Task not found.</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="rounded-[12px] border border-border bg-card shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset]">
              {/* Color bar */}
              {task.color ? (
                <div className="h-1.5 rounded-t-[12px]" style={{ backgroundColor: ODOO_COLORS[task.color] || "var(--c-border)" }} />
              ) : null}
              <div className="p-8">
              {/* Title + badges */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary flex-1">
                  {task.name}
                </h1>
                {task.isMyTask && (
                  <span className="shrink-0 rounded-[4px] bg-accent px-1.5 py-0.5 text-[10px] font-medium leading-[14px] text-white tracking-[-0.1px]">
                    Mine
                  </span>
                )}
              </div>

              {/* Info grid - always visible */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px] mb-1">Stage</p>
                  <p className="text-[14px] leading-[20px] text-text-primary">{task.stageName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px] mb-1">Priority</p>
                  <span className="inline-flex items-center rounded-[4px] bg-surface px-2 py-0.5 text-[12px] font-medium leading-[16px]" style={{ color: getPriorityColor(task.priority) }}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px] mb-1">Assignees</p>
                  {task.assignees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {task.assignees.map((a: [number, string]) => (
                        <div key={a[0]} className="flex items-center gap-1.5 rounded-[4px] bg-surface px-2 py-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[9px] font-medium text-text-secondary border border-border">{a[1].charAt(0).toUpperCase()}</div>
                          <span className="text-[12px] leading-[16px] text-text-secondary">{a[1]}</span>
                        </div>
                      ))}
                    </div>
                  ) : (<p className="text-[14px] leading-[20px] text-text-muted">Unassigned</p>)}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-[8px] bg-surface p-1 mb-6">
                <button type="button" onClick={() => navigate({ to: `/projects/${projectId}/tasks/${taskId}` })}
                  className={`px-3 py-1.5 text-[13px] font-medium leading-[18px] rounded-[6px] transition-all duration-150 cursor-pointer ${activeTab === "description" ? "bg-card text-text-primary shadow-[0px_1px_1px_#00000008,0_0_0_1px_#0000000a_inset]" : "text-text-muted hover:text-text-secondary"}`}>
                  Description
                </button>
                <button type="button" onClick={() => navigate({ to: `/projects/${projectId}/tasks/${taskId}/timesheet` })}
                  className={`px-3 py-1.5 text-[13px] font-medium leading-[18px] rounded-[6px] transition-all duration-150 cursor-pointer ${activeTab === "timesheet" ? "bg-card text-text-primary shadow-[0px_1px_1px_#00000008,0_0_0_1px_#0000000a_inset]" : "text-text-muted hover:text-text-secondary"}`}>
                  Timesheet
                  {timesheets.length > 0 && (
                    <span className={`ml-1.5 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium leading-3.5 ${activeTab === "timesheet" ? "bg-surface text-text-primary" : "bg-card text-text-muted"}`}>{timesheets.length}</span>
                  )}
                </button>
              </div>

              {/* Tab: Description */}
              {activeTab === "description" && (
                <>
                  {task.description ? (
                    <div>
                      <div className="text-[14px] leading-[22px] text-text-secondary [&_p]:mb-2 [&_h1]:text-[18px] [&_h1]:font-semibold [&_h1]:text-text-primary [&_h1]:mt-4 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mt-3 [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_br]:block [&_br]:content-[''] [&_br]:my-1" dangerouslySetInnerHTML={{ __html: task.description }} />
                    </div>
                  ) : (
                    <p className="text-[14px] leading-[20px] text-text-muted">No description provided.</p>
                  )}
                </>
              )}

              {/* Tab: Timesheet */}
              {activeTab === "timesheet" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px] font-medium leading-[18px] text-text-secondary">
                      {timesheets.length > 0
                        ? `${timesheets.length} entr${timesheets.length === 1 ? "y" : "ies"} — ${timesheets.reduce((s: number, t: any) => s + t.hours, 0).toFixed(1)}h total`
                        : "No timesheet entries"}
                    </p>
                  </div>
                  {timesheets.length > 0 && (
                    <div className="overflow-x-auto rounded-[8px] border border-border">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border bg-page">
                            <th className="px-3 py-2 text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px]">Date</th>
                            <th className="px-3 py-2 text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px]">Description</th>
                            <th className="px-3 py-2 text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px]">User</th>
                            <th className="px-3 py-2 text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px] text-right">Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timesheets.map((ts: any) => (
                            <tr key={ts.id} onClick={() => { setSelectedTs(ts); setEditDate(ts.date?.split("T")[0] || ""); setEditName(ts.name || ""); setEditHours(String(ts.hours ?? "")); setEditUserId(String(ts.userId ?? "")); setEditError(""); setEditSuccess(""); editDialog.show(); }} className="border-b border-border last:border-0 hover:bg-page transition-colors cursor-pointer">
                              <td className="px-3 py-2 text-[13px] leading-[18px] text-text-primary whitespace-nowrap">{ts.date ? new Date(ts.date).toLocaleDateString() : "—"}</td>
                              <td className="px-3 py-2 text-[13px] leading-[18px] text-text-secondary max-w-[300px] truncate">{ts.name || "—"}</td>
                              <td className="px-3 py-2 text-[13px] leading-[18px] text-text-secondary whitespace-nowrap">{ts.userName || "—"}</td>
                              <td className="px-3 py-2 text-[13px] leading-[18px] text-text-primary text-right font-medium whitespace-nowrap tabular-nums">{ts.hours.toFixed(1)}h</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border bg-page">
                            <td colSpan={3} className="px-3 py-2 text-[12px] font-semibold leading-[16px] text-text-primary">Total</td>
                            <td className="px-3 py-2 text-[13px] font-semibold leading-[18px] text-text-primary text-right tabular-nums">{timesheets.reduce((s: number, t: any) => s + t.hours, 0).toFixed(1)}h</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Back button */}
              <div className="mt-8 pt-6 border-t border-border">
                <Link to="/projects/$projectId" params={{ projectId }}>
                  <Button variant="secondary" size="md">← Back to Kanban</Button>
                </Link>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Timesheet edit dialog */}
      <Dialog open={editDialog.open} onClose={() => { setEditError(""); setEditSuccess(""); editDialog.close(); }}>
        <DialogHeader title="Edit timesheet entry" description="Update the details below." onClose={() => { setEditError(""); setEditSuccess(""); editDialog.close(); }} />
        <DialogBody>
          {selectedTs && (
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <DatePicker
                  value={editDate || selectedTs?.date?.split("T")[0] || ""}
                  onChange={(val) => setEditDate(val)}
                  wrapperClassName="max-w-full" />
              </div>
              <div>
                <Label>Description</Label>
                <Input type="text"
                  defaultValue={selectedTs.name || ""}
                  onChange={(e: any) => setEditName(e.target.value)}
                  placeholder="Description" wrapperClassName="max-w-full" />
              </div>
              <div>
                <Label>Hours</Label>
                <NumberInput
                  value={editHours}
                  onChange={(val) => setEditHours(val)}
                  step={0.5} min={0}
                  wrapperClassName="max-w-full" />
              </div>
              <div>
                <Label>User</Label>
                <SelectMenu
                  options={userItems.map((u: CatalogItem) => ({ value: u.key, label: u.value }))}
                  value={editUserId}
                  onChange={(val) => setEditUserId(val)}
                  placeholder="Select user..."
                  wrapperClassName="max-w-full" />
              </div>
              {editError && (
                <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="rounded-[6px] bg-info-bg border border-accent/20 px-3 py-2 text-[13px] leading-[18px] text-info-text">
                  {editSuccess}
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={() => { setEditError(""); setEditSuccess(""); editDialog.close(); }} disabled={saving}>Cancel</Button>
          <Button size="md" onClick={handleEditSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </Dialog>

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

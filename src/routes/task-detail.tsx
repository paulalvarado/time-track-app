import { createRoute, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Dropdown, DropdownItem, DropdownDivider, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Input, Label, DatePicker, NumberInput, SelectMenu, Textarea, Tooltip } from "../components/ui";
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

  // AI Recording states
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState("audio/webm");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [suggestions, setSuggestions] = useState<{ date: string; concept: string; hours: number }[]>([]);
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState<string | null>(null);
  const [aiDialogTab, setAiDialogTab] = useState<"voice" | "manual">("voice");
  const [selectedForDelete, setSelectedForDelete] = useState<Set<number>>(new Set());
  const [manualConcept, setManualConcept] = useState("");
  const [manualHours, setManualHours] = useState("");
  const [manualDate, setManualDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items: priorityItems } = useCatalog("priority");
  const { items: userItems } = useCatalog("employees");
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

  // ─── AI Recording ───

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      setAudioMimeType(mimeType);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        if (chunksRef.current.length === 0) return;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setAudioBase64(base64);
        };
        reader.readAsDataURL(blob);

        // Stop the duration timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recorder.start(250); // Collect data every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setAiError("Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const handleMicMouseDown = useCallback(() => {
    pressTimerRef.current = setTimeout(() => {
      startRecording();
    }, 200); // 200ms hold to start recording
  }, [startRecording]);

  const handleMicMouseUpOrLeave = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  // ─── AI Transcribe ───

  const handleTranscribe = async () => {
    if (!audioBase64) return;
    setAiLoading(true);
    setAiError("");

    try {
      const res = await fetch("/api/ai/transcribe-timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: audioBase64, mimeType: audioMimeType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Transcription failed");
      } else {
        setSuggestions(data.entries || []);
      }
    } catch {
      setAiError("Connection error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Send audio to AI when it becomes available
  useEffect(() => {
    if (audioBase64 && !isRecording) {
      handleTranscribe();
    }
  }, [audioBase64, isRecording]);

  // ─── Batch Save ───

  // ─── Suggestion actions ───

  const handleDeleteEntry = (idx: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== idx));
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      next.delete(idx);
      // Re-map indices
      return new Set([...next].map((i) => (i > idx ? i - 1 : i)));
    });
  };

  const toggleSelectEntry = (idx: number) => {
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const indices = [...selectedForDelete].sort((a, b) => b - a); // descending
    setSuggestions((prev) => prev.filter((_, i) => !selectedForDelete.has(i)));
    setSelectedForDelete(new Set());
  };

  const handleAddManualEntry = () => {
    if (!manualConcept.trim() || !manualHours) return;
    const hours = parseFloat(manualHours);
    if (isNaN(hours) || hours <= 0) return;
    setSuggestions((prev) => [
      ...prev,
      { date: manualDate, concept: manualConcept.trim(), hours },
    ]);
    setManualConcept("");
    setManualHours("");
    const d = new Date(); setManualDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const handleSaveSuggestions = async () => {
    if (suggestions.length === 0) return;
    setSavingBatch(true);
    setBatchResult(null);

    const entries = suggestions.map((s) => ({
      concept: s.concept,
      hours: s.hours,
      date: s.date,
    }));

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/timesheets/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (data.ok) {
        setBatchResult(data.message || "Entries saved.");
        // Refresh timesheets
        fetch(`/api/sync/projects/${projectId}/tasks/${taskId}/timesheets`)
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setTimesheets(d.timesheets || []); })
          .catch(() => {});
        // Close dialog after 2s
        setTimeout(() => { setShowAiDialog(false); setBatchResult(null); setSuggestions([]); }, 2000);
      } else {
        setAiError(data.message || "Failed to save entries.");
      }
    } catch {
      setAiError("Connection error. Please try again.");
    } finally {
      setSavingBatch(false);
    }
  };

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
                <div className="relative">
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
                            <tr key={ts.id} onClick={() => { setSelectedTs(ts); const d = ts.date ? new Date(ts.date) : new Date(); const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; setEditDate(localDate); setEditName(ts.name || ""); setEditHours(String(ts.hours ?? "")); setEditUserId(String(ts.userId ?? "")); setEditError(""); setEditSuccess(""); editDialog.show(); }} className="border-b border-border last:border-0 hover:bg-page transition-colors cursor-pointer">
                              <td className="px-3 py-2 text-[13px] leading-[18px] text-text-primary whitespace-nowrap">{ts.date ? new Date(ts.date).toLocaleDateString() : "—"}</td>
                              <td className="px-3 py-2 text-[13px] leading-[18px] text-text-secondary max-w-[300px] truncate">
                                {ts.name ? (
                                  <Tooltip content={ts.name}>
                                    <span className="block truncate">{ts.name}</span>
                                  </Tooltip>
                                ) : "—"}
                              </td>
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

                  {/* FAB - Floating Action Button */}
                  <button
                    onClick={() => { setShowAiDialog(true); setAiError(""); setSuggestions([]); setAudioBase64(null); setBatchResult(null); }}
                    className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0px_4px_12px_#0070f34d,0px_1px_2px_#0000001a] hover:bg-accent/90 hover:shadow-[0px_6px_16px_#0070f366] active:scale-95 transition-all duration-200 cursor-pointer"
                    aria-label="Add timesheet entries"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
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
                <Textarea
                  defaultValue={selectedTs.name || ""}
                  onChange={(e: any) => setEditName(e.target.value)}
                  placeholder="Description" wrapperClassName="max-w-full" rows={3} />
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

      {/* AI Recording Dialog */}
      <Dialog open={showAiDialog} onClose={() => { if (!isRecording && !aiLoading && !savingBatch) { setShowAiDialog(false); setSuggestions([]); setAiError(""); setBatchResult(null); setAudioBase64(null); setAiDialogTab("voice"); setSelectedForDelete(new Set()); } }}>
        <DialogHeader
          title="Add timesheet entries"
          description="Add entries via voice note or manually."
          onClose={() => { if (!isRecording && !aiLoading && !savingBatch) { setShowAiDialog(false); setSuggestions([]); setAiError(""); setBatchResult(null); setAudioBase64(null); setAiDialogTab("voice"); setSelectedForDelete(new Set()); } }}
        />
        <DialogBody>
          <div className="space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-[8px] bg-surface p-1">
              <button type="button" onClick={() => setAiDialogTab("voice")}
                className={`px-3 py-1.5 text-[13px] font-medium leading-[18px] rounded-[6px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  aiDialogTab === "voice"
                    ? "bg-card text-text-primary shadow-[0px_1px_1px_#00000008,0_0_0_1px_#0000000a_inset]"
                    : "text-text-muted hover:text-text-secondary"
                }`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                Voice note
              </button>
              <button type="button" onClick={() => setAiDialogTab("manual")}
                className={`px-3 py-1.5 text-[13px] font-medium leading-[18px] rounded-[6px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  aiDialogTab === "manual"
                    ? "bg-card text-text-primary shadow-[0px_1px_1px_#00000008,0_0_0_1px_#0000000a_inset]"
                    : "text-text-muted hover:text-text-secondary"
                }`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Manual entry
              </button>
            </div>

            {/* Tab: Voice note */}
            {aiDialogTab === "voice" && !audioBase64 && !aiLoading && suggestions.length === 0 && (
              <div className="flex flex-col items-center gap-6 py-4">
                <button
                  onMouseDown={handleMicMouseDown}
                  onMouseUp={handleMicMouseUpOrLeave}
                  onMouseLeave={handleMicMouseUpOrLeave}
                  onTouchStart={handleMicMouseDown}
                  onTouchEnd={handleMicMouseUpOrLeave}
                  className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none
                    ${isRecording
                      ? "bg-red-500 scale-110"
                      : "bg-accent hover:bg-accent/90 active:scale-95 shadow-[0px_4px_12px_#0070f34d]"
                    }`}
                  aria-label={isRecording ? "Recording... release to stop" : "Hold to record"}
                >
                  {isRecording && (
                    <>
                      <span className="absolute inset-0 rounded-full border-4 border-red-400/60 animate-ping-slow" />
                      <span className="absolute inset-2 rounded-full border-2 border-red-300/40 animate-ping-slow" style={{ animationDelay: "0.3s" }} />
                    </>
                  )}
                  <svg className="h-10 w-10 relative z-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                </button>

                {isRecording && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-end gap-1 h-8">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1.5 bg-red-400 rounded-full animate-wave" style={{ height: "32px", animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[13px] font-medium leading-[18px] text-red-500">
                        Recording... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <p className="text-[12px] leading-[16px] text-text-muted">Release to stop</p>
                  </div>
                )}

                {!isRecording && (
                  <p className="text-[13px] leading-[18px] text-text-secondary text-center max-w-xs">
                    Hold the microphone button and speak clearly about the work you did.
                  </p>
                )}
              </div>
            )}

            {/* Loading AI */}
            {aiLoading && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="relative flex items-center justify-center">
                  <svg className="h-10 w-10 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="text-[14px] font-medium leading-[20px] text-text-primary">Processing your voice note...</p>
              </div>
            )}

            {/* Tab: Manual entry */}
            {aiDialogTab === "manual" && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Date</Label>
                  <DatePicker value={manualDate} onChange={(val) => setManualDate(val)} wrapperClassName="max-w-full" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="What did you work on?" value={manualConcept} onChange={(e: any) => setManualConcept(e.target.value)} wrapperClassName="max-w-full" rows={3} />
                </div>
                <div>
                  <Label>Hours</Label>
                  <div className="flex gap-2">
                    <NumberInput value={manualHours} onChange={(val) => setManualHours(val)} step={0.5} min={0} wrapperClassName="flex-1" />
                    <Button size="md" onClick={handleAddManualEntry} disabled={!manualConcept.trim() || !manualHours}>Add entry</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {aiError && (
              <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">{aiError}</div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold leading-[20px] text-text-primary">Entries ({suggestions.length})</p>
                    {selectedForDelete.size > 0 && (
                      <button onClick={handleDeleteSelected} className="text-[12px] font-medium leading-[16px] text-danger hover:text-danger/80 transition-colors cursor-pointer">
                        Delete {selectedForDelete.size} selected
                      </button>
                    )}
                  </div>
                  <p className="text-[12px] leading-[16px] text-text-muted">Total: {suggestions.reduce((s, e) => s + e.hours, 0).toFixed(1)}h</p>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {suggestions.map((entry, idx) => (
                    <div key={idx}
                      className={`rounded-[8px] border p-3 transition-colors ${
                        selectedForDelete.has(idx) ? "border-danger/40 bg-danger-bg/30" : "border-border bg-card"
                      }`}>
                      <div className="flex items-start gap-3">
                        <div onClick={() => toggleSelectEntry(idx)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors ${
                            selectedForDelete.has(idx) ? "border-danger bg-danger text-white" : "border-border hover:border-text-muted"
                          }`}>
                          {selectedForDelete.has(idx) && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px]">#{idx + 1}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[16px] font-semibold leading-[22px] text-accent">{entry.hours.toFixed(1)}h</span>
                              <button onClick={() => handleDeleteEntry(idx)}
                                className="flex h-6 w-6 items-center justify-center rounded-[4px] text-text-muted hover:text-danger hover:bg-danger-bg/50 transition-colors cursor-pointer"
                                title="Delete entry">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-[13px] font-medium leading-[18px] text-text-primary mt-1 line-clamp-2">{entry.concept}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] leading-[16px] text-text-muted">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            {new Date(entry.date + "T12:00:00").toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch result */}
            {batchResult && (
              <div className="rounded-[6px] bg-success-bg border border-success/20 px-3 py-2 text-[13px] leading-[18px] text-success-text flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {batchResult}
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          {suggestions.length > 0 && !batchResult && (
            <>
              <button
                type="button"
                onClick={() => { setShowAiDialog(false); setSuggestions([]); setAiError(""); setAudioBase64(null); setAiDialogTab("voice"); setSelectedForDelete(new Set()); }}
                disabled={savingBatch}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[6px] border transition-all duration-150 focus:outline-none focus:ring-[3px] focus:ring-text-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 px-4 text-[14px] font-medium leading-[20px] bg-card text-text-primary hover:bg-page border-border"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveSuggestions}
                disabled={savingBatch || suggestions.length === 0}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[6px] border transition-all duration-150 focus:outline-none focus:ring-[3px] focus:ring-text-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 px-4 text-[14px] font-medium leading-[20px] border-transparent bg-[#171717] text-white dark:bg-white dark:text-[#171717] hover:bg-[#000000] dark:hover:bg-white/90"
              >
                {savingBatch ? "Saving..." : `Save All (${suggestions.reduce((s, e) => s + e.hours, 0).toFixed(1)}h)`}
              </button>
            </>
          )}
          {!suggestions.length && !aiLoading && !batchResult && (
            <button
              type="button"
              onClick={() => { setShowAiDialog(false); setAiError(""); setAudioBase64(null); setAiDialogTab("voice"); setSelectedForDelete(new Set()); }}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[6px] border transition-all duration-150 focus:outline-none focus:ring-[3px] focus:ring-text-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 px-4 text-[14px] font-medium leading-[20px] bg-card text-text-primary hover:bg-page border-border"
            >
              Cancel
            </button>
          )}
          {batchResult && (
            <button
              type="button"
              onClick={() => { setShowAiDialog(false); setSuggestions([]); setBatchResult(null); setAudioBase64(null); setAiDialogTab("voice"); setSelectedForDelete(new Set()); }}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[6px] border transition-all duration-150 focus:outline-none focus:ring-[3px] focus:ring-text-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 px-4 text-[14px] font-medium leading-[20px] border-transparent bg-[#171717] text-white dark:bg-white dark:text-[#171717] hover:bg-[#000000] dark:hover:bg-white/90"
            >
              Done
            </button>
          )}
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

import { createRoute, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSetBreadcrumb } from "../components/breadcrumb-context";
import { Button, Dropdown, DropdownItem, DropdownDivider, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, ScrollArea, SelectMenu, Label, Input, Textarea } from "../components/ui";
import { PageHeader } from "../components/page-header";
import { useCatalog, type CatalogItem } from "../lib/use-catalog";
import { useDarkMode } from "../lib/use-dark-mode";
import { Route as authLayout } from "../layouts/auth-layout";

export const Route = createRoute({
  getParentRoute: () => authLayout,
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

export function ProjectTasksPage() {
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
  const { items: userItems } = useCatalog("users");
  const { isDark, toggle: toggleDark } = useDarkMode();

  // Add task dialog states
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [addTaskTab, setAddTaskTab] = useState<"voice" | "manual">("voice");
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStageId, setTaskStageId] = useState(() => localStorage.getItem("lastTaskStageId") || "");
  const [taskColor, setTaskColor] = useState(() => localStorage.getItem("lastTaskColor") || "");
  const [taskOwnerId, setTaskOwnerId] = useState(() => localStorage.getItem("lastTaskOwnerId") || "");
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskAiError, setTaskAiError] = useState("");
  const [taskAiLoading, setTaskAiLoading] = useState(false);
  const [taskSuggestions, setTaskSuggestions] = useState<{ name: string; description: string; stageId: number | null }[]>([]);
  const [taskSaved, setTaskSaved] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState("audio/webm");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist task dialog selections
  useEffect(() => { if (taskStageId) localStorage.setItem("lastTaskStageId", taskStageId); }, [taskStageId]);
  useEffect(() => { if (taskColor) localStorage.setItem("lastTaskColor", taskColor); }, [taskColor]);
  useEffect(() => { if (taskOwnerId) localStorage.setItem("lastTaskOwnerId", taskOwnerId); }, [taskOwnerId]);

  const getPriorityLabel = (key: string): string => {
    const found = priorityItems.find((i: CatalogItem) => i.key === key);
    return found?.value || key;
  };
  const getPriorityColor = (key: string): string => PRIORITY_COLORS[key] || "#888888";

  useEffect(() => {
    const match = window.location.pathname.match(/\/projects\/(\d+)/);
    if (match) setProjectId(match[1]);
  }, []);

  // Refresh tasks from local DB
  const refreshTasks = useCallback(() => {
    if (!projectId) return;
    fetch(`/api/sync/projects/${projectId}/tasks`)
      .then((res) => res.ok ? res.json() : null)
      .then((tasksData) => {
        if (tasksData) {
          setProjectName(tasksData.projectName || `Project #${projectId}`);
          setTasks(tasksData.tasks || []);
          setStages(tasksData.stages || []);
          setLastSyncAt(tasksData.lastSyncAt || null);
        }
      })
      .catch(() => {});
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = () => {
      fetch("/api/auth/me")
        .then(async (userRes) => {
          if (!userRes.ok) throw new Error("Unauthorized");
          const userData = await userRes.json();
          setUser(userData.user);

          // Track project: marca como visitado y si es primera vez, trae data de Odoo
          return fetch(`/api/sync/projects/${projectId}/track`, { method: "POST" }).then(() => {
            refreshTasks();
          });
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
  }, [navigate, projectId, refreshTasks]);

  const handleLogout = () => { fetch("/api/auth/logout", { method: "POST" }).catch(() => {}); navigate({ to: "/login" }); };

  // ─── Task recording ───

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
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length === 0) return;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setAudioBase64(base64);
        };
        reader.readAsDataURL(blob);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } catch {
        setTaskAiError("Acceso al micrófono denegado. Por favor permite los permisos del micrófono.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const handleMicMouseDown = useCallback(() => {
    pressTimerRef.current = setTimeout(() => startRecording(), 200);
  }, [startRecording]);

  const handleMicMouseUpOrLeave = useCallback(() => {
    if (pressTimerRef.current) { clearTimeout(pressTimerRef.current); pressTimerRef.current = null; }
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  // ─── Task AI transcribe ───

  const handleTaskTranscribe = async () => {
    if (!audioBase64) return;
    setTaskAiLoading(true);
    setTaskAiError("");

    const stageOptions = stages.map((s) => ({ id: s.id, name: s.name }));

    try {
      const res = await fetch("/api/ai/transcribe-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: audioBase64, mimeType: audioMimeType, stageOptions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTaskAiError(data.error || "Transcripción fallida");
      } else {
        setTaskSuggestions(data.tasks || []);
      }
    } catch {
      setTaskAiError("Error de conexión. Intenta de nuevo.");
    } finally {
      setTaskAiLoading(false);
    }
  };

  useEffect(() => {
    if (audioBase64 && !isRecording) handleTaskTranscribe();
  }, [audioBase64, isRecording]);

  // ─── Task save ───

  const handleTaskSave = async (task: { name: string; description?: string; stageId?: number | null }) => {
    setTaskSaving(true);
    setTaskAiError("");

    try {
      const res = await fetch(`/api/sync/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: task.name,
          description: task.description || "",
          stageId: task.stageId || (taskStageId ? parseInt(taskStageId) : null),
          ownerId: taskOwnerId ? parseInt(taskOwnerId) : null,
          color: taskColor ? parseInt(taskColor) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la tarea");
      }
      refreshTasks();
      return data;
    } catch (e: any) {
      setTaskAiError(e.message || "Error al guardar la tarea");
      throw e;
    } finally {
      setTaskSaving(false);
    }
  };

  const handleSaveAllSuggestions = async () => {
    setTaskAiError("");
    let savedCount = 0;
    for (const task of taskSuggestions) {
      try {
        await handleTaskSave(task);
        savedCount++;
      } catch {
        break;
      }
    }
    if (savedCount > 0) {
      setTaskSaved(`¡Tarea${savedCount > 1 ? 's' : ''} creada${savedCount > 1 ? 's' : ''} correctamente!`);
      setTimeout(() => {
        setShowAddTaskDialog(false);
        setTaskSaved(null);
        setTaskSuggestions([]);
        setAudioBase64(null);
        setTaskName("");
        setTaskDescription("");
      }, 2000);
    }
  };

  const handleAddManualTask = async () => {
    if (!taskName.trim()) return;
    try {
      await handleTaskSave({
        name: taskName.trim(),
        description: taskDescription.trim(),
      });
      setTaskSaved("¡Tarea creada correctamente!");
      setTimeout(() => {
        setShowAddTaskDialog(false);
        setTaskSaved(null);
        setTaskSuggestions([]);
        setAudioBase64(null);
        setTaskName("");
        setTaskDescription("");
      }, 2000);
    } catch {}
  };

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

  const isAdminPath = useLocation().pathname.startsWith("/admin");
  useSetBreadcrumb(isAdminPath 
    ? [
        { label: "Proyectos", to: "/projects" },
        { label: projectName || (projectId ? `Proyecto #${projectId}` : "Cargando...") },
      ]
    : null);

  return (
    <main className="min-h-screen max-h-screen overflow-hidden bg-page">


      <div className="mx-auto max-w-[1200px] px-6 pt-8">
        <PageHeader
          title={projectName}
          description={`${tasks.length} tarea${tasks.length === 1 ? "" : "s"}`}
          {...(isAdminPath ? {} : {
            breadcrumbs: [
              { label: "Proyectos", to: "/projects" },
              { label: projectName },
            ]
          })}
        />
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="mx-auto max-w-[1200px] px-6 flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-[14px] text-text-muted">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando...
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[1200px] px-6 pb-8" style={{ height: "calc(100vh - 212px)" }}>
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
                  <p className="text-[14px] font-medium leading-[20px] text-danger-text">No se pudieron cargar las tareas</p>
                  <p className="mt-1 text-[13px] leading-[18px] text-text-muted">{fetchError}</p>
                </>
              ) : (
                <p className="text-[14px] leading-[20px] text-text-muted">No se encontraron tareas para este proyecto.</p>
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
                        {stage?.name || "Sin categoría"} ({stageTasks.length})
                      </span>
                    </div>
                  ) : null}
                  {!collapsedStages.has(stageId) ? (
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="flex items-center justify-between mb-3 px-2.5 py-2 border border-border rounded-[8px] cursor-pointer bg-page" onClick={() => toggleStage(stageId)}>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-semibold leading-[18px] text-text-primary uppercase tracking-[-0.1px]">
                            {stage?.name || "Sin categoría"}
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
                          to={window.location.pathname.startsWith("/admin") ? "/admin/projects/$projectId/tasks/$taskId" : "/projects/$projectId/tasks/$taskId"}
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
                                  <span className="text-[11px] leading-[16px] text-text-muted truncate max-w-[100px]">{task.assignees[0][1] || "Sin asignar"}</span>
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
      )}

      {/* FAB - Add Task */}
      <button
        onClick={() => {
          setShowAddTaskDialog(true);
          setTaskAiError("");
          setTaskSuggestions([]);
          setAudioBase64(null);
          setTaskSaved(null);
          setAddTaskTab("voice");
        }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0px_4px_12px_#0070f34d,0px_1px_2px_#0000001a] hover:bg-accent/90 hover:shadow-[0px_6px_16px_#0070f366] active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Añadir tarea"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onClose={() => { if (!isRecording && !taskAiLoading && !taskSaving) { setShowAddTaskDialog(false); setTaskSuggestions([]); setTaskAiError(""); setTaskSaved(null); setAudioBase64(null); setAddTaskTab("voice"); setTaskName(""); setTaskDescription(""); } }}>
        <DialogHeader
          title="Añadir tarea"
          description="Crea una nueva tarea por voz o manualmente."
          onClose={() => { if (!isRecording && !taskAiLoading && !taskSaving) { setShowAddTaskDialog(false); setTaskSuggestions([]); setTaskAiError(""); setTaskSaved(null); setAudioBase64(null); setAddTaskTab("voice"); setTaskName(""); setTaskDescription(""); } }}
        />
        <DialogBody>
          <div className="space-y-5">
            {/* Stage selector */}
            <div>
              <Label>Etapa</Label>
              <SelectMenu
                options={stages.map((s) => ({ value: String(s.id), label: s.name }))}
                value={taskStageId}
                onChange={(val) => setTaskStageId(val)}
                placeholder="Seleccionar etapa..."
                wrapperClassName="max-w-full" />
            </div>

            {/* Color selector */}
            <div>
              <Label>Color</Label>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(ODOO_COLORS).map(([key, color]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTaskColor(key)}
                    className={`h-7 w-7 rounded-[6px] border transition-all duration-150 cursor-pointer ${
                      taskColor === key ? "ring-2 ring-text-primary scale-110" : "ring-0"
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Color ${key}`}
                  />
                ))}
              </div>
            </div>

            {/* Owner selector */}
            <div>
              <Label>Asignado</Label>
              <SelectMenu
                options={userItems.map((u: CatalogItem) => ({ value: u.key, label: u.value }))}
                value={taskOwnerId}
                onChange={(val) => setTaskOwnerId(val)}
                placeholder="Seleccionar responsable..."
                wrapperClassName="max-w-full" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-[8px] bg-surface p-1">
              <button type="button" onClick={() => setAddTaskTab("voice")}
                className={`px-3 py-1.5 text-[13px] font-medium leading-[18px] rounded-[6px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  addTaskTab === "voice"
                    ? "bg-card text-text-primary shadow-[0px_1px_1px_#00000008,0_0_0_1px_#0000000a_inset]"
                    : "text-text-muted hover:text-text-secondary"
                }`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                Nota de voz
              </button>
              <button type="button" onClick={() => setAddTaskTab("manual")}
                className={`px-3 py-1.5 text-[13px] font-medium leading-[18px] rounded-[6px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  addTaskTab === "manual"
                    ? "bg-card text-text-primary shadow-[0px_1px_1px_#00000008,0_0_0_1px_#0000000a_inset]"
                    : "text-text-muted hover:text-text-secondary"
                }`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Manual
              </button>
            </div>

            {/* Tab: Voice note */}
            {addTaskTab === "voice" && !audioBase64 && !taskAiLoading && taskSuggestions.length === 0 && (
              <div className="flex flex-col items-center gap-6 py-4">
                <button
                  onMouseDown={handleMicMouseDown}
                  onMouseUp={handleMicMouseUpOrLeave}
                  onMouseLeave={handleMicMouseUpOrLeave}
                  onTouchStart={handleMicMouseDown}
                  onTouchEnd={handleMicMouseUpOrLeave}
                  className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none
                    ${isRecording ? "bg-red-500 scale-110" : "bg-accent hover:bg-accent/90 active:scale-95 shadow-[0px_4px_12px_#0070f34d]"}`}
                  aria-label={isRecording ? "Grabando... suelta para detener" : "Mantén para grabar"}
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
                      <span className="text-[13px] font-medium leading-[18px] text-red-500">Grabando... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")}</span>
                    </div>
                    <p className="text-[12px] leading-[16px] text-text-muted">Suelta para detener</p>
                  </div>
                )}
                {!isRecording && (
                  <p className="text-[13px] leading-[18px] text-text-secondary text-center max-w-xs">Mantén presionado el micrófono y describe la tarea que deseas crear.</p>
                )}
              </div>
            )}

            {/* Loading AI */}
            {taskAiLoading && (
              <div className="flex flex-col items-center gap-4 py-6">
                <svg className="h-10 w-10 animate-spin text-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <p className="text-[14px] font-medium leading-[20px] text-text-primary">Procesando tu nota de voz...</p>
              </div>
            )}

            {/* Tab: Manual entry */}
            {addTaskTab === "manual" && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Nombre de la tarea</Label>
                  <Input value={taskName} onChange={(e: any) => setTaskName(e.target.value)} placeholder="¿Qué hay que hacer?" wrapperClassName="max-w-full" />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea value={taskDescription} onChange={(e: any) => setTaskDescription(e.target.value)} placeholder="Detalles de la tarea (opcional)" wrapperClassName="max-w-full" rows={3} />
                </div>
              </div>
            )}

            {/* Error */}
            {taskAiError && (
              <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">{taskAiError}</div>
            )}

            {/* Suggestions */}
            {taskSuggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-semibold leading-[20px] text-text-primary">Tareas ({taskSuggestions.length})</p>
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {taskSuggestions.map((task, idx) => (
                    <div key={idx} className="rounded-[8px] border border-border bg-card p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold leading-[16px] text-text-muted uppercase tracking-[-0.1px]">#{idx + 1}</span>
                          </div>
                          <p className="text-[13px] font-medium leading-[18px] text-text-primary mt-1 line-clamp-2">{task.name}</p>
                          {task.description && (
                            <p className="text-[12px] leading-[16px] text-text-muted mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task saved */}
            {taskSaved && (
              <div className="rounded-[6px] bg-success-bg border border-success/20 px-3 py-2 text-[13px] leading-[18px] text-success-text flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                {taskSaved}
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          {addTaskTab === "manual" && !taskSuggestions.length && !taskSaved && (
            <>
              <Button variant="secondary" size="md" onClick={() => { setShowAddTaskDialog(false); setTaskSuggestions([]); setTaskAiError(""); setAudioBase64(null); setAddTaskTab("voice"); setTaskName(""); setTaskDescription(""); }} disabled={taskSaving}>Cancelar</Button>
              <Button size="md" onClick={handleAddManualTask} disabled={taskSaving || !taskName.trim()}>{taskSaving ? "Guardando..." : "Crear tarea"}</Button>
            </>
          )}
          {taskSuggestions.length > 0 && !taskSaved && (
            <>
              <Button variant="secondary" size="md" onClick={() => { setShowAddTaskDialog(false); setTaskSuggestions([]); setTaskAiError(""); setAudioBase64(null); setAddTaskTab("voice"); setTaskName(""); setTaskDescription(""); }} disabled={taskSaving}>Cancelar</Button>
              <Button size="md" onClick={handleSaveAllSuggestions} disabled={taskSaving || taskSuggestions.length === 0}>{taskSaving ? "Guardando..." : `Crear todas (${taskSuggestions.length})`}</Button>
            </>
          )}
          {!taskSuggestions.length && !taskAiLoading && !taskSaved && addTaskTab === "voice" && (
            <Button variant="secondary" size="md" onClick={() => { setShowAddTaskDialog(false); setTaskAiError(""); setAudioBase64(null); setAddTaskTab("voice"); setTaskName(""); setTaskDescription(""); }}>Cancelar</Button>
          )}
          {taskSaved && (
            <Button size="md" onClick={() => { setShowAddTaskDialog(false); setTaskSuggestions([]); setTaskSaved(null); setAudioBase64(null); setAddTaskTab("voice"); setTaskName(""); setTaskDescription(""); }}>Hecho</Button>
          )}
        </DialogFooter>
      </Dialog>

      {/* Sign out dialog */}
      <Dialog open={confirmLogout.open} onClose={confirmLogout.close}>
        <DialogHeader title="Cerrar sesión" description="¿Estás seguro de que quieres cerrar sesión?" onClose={confirmLogout.close} />
        <DialogBody>Tu sesión se cerrará.</DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={confirmLogout.close}>Cancelar</Button>
          <Button variant="danger" size="md" onClick={handleLogout}>Cerrar sesión</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

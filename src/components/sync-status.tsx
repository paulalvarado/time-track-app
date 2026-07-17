import { useState, useEffect, useRef } from "react";

let autoTriggered = false; // module-level flag: resets on page reload, persists across SPA navigations

type SyncState = {
  status: "idle" | "running" | "completed" | "error" | "obsolete";
  progress: number;
  log?: string;
};

export function SyncStatus({ collapsed }: { collapsed: boolean }) {
  const [sync, setSync] = useState<SyncState>({ status: "idle", progress: 0 });
  const [triggering, setTriggering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/sync/progress");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setSync({
          status: data.status,
          progress: data.progress,
          log: data.log,
        });
        if (data.status === "completed" || data.status === "error" || data.status === "obsolete") {
          stopPolling();
          if (data.status === "completed") {
            setTimeout(() => setSync({ status: "idle", progress: 0 }), 5000);
          }
        }
      } catch {
        stopPolling();
      }
    }, 1000);
  };

  const handleSync = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/sync/trigger", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSync({ status: "running", progress: 0 });
      startPolling();
    } catch {
      setSync({ status: "error", progress: 0, log: "Error al iniciar sincronización" });
    } finally {
      setTriggering(false);
    }
  };

  // Check progress on mount and trigger sync if needed
  useEffect(() => {
    if (autoTriggered) {
      // Already auto-triggered in this page session (navigated from another page)
      // Still check for a running sync from login
      fetch("/api/sync/progress")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed");
          const data = await res.json();
          if (data.status === "running") {
            setSync({ status: "running", progress: data.progress, log: data.log });
            startPolling();
          }
        })
        .catch(() => {});
      return stopPolling;
    }

    fetch("/api/sync/progress")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        if (data.status === "running") {
          // There's already a sync running → poll
          setSync({ status: "running", progress: data.progress, log: data.log });
          autoTriggered = true;
          startPolling();
        } else {
          // No sync running → trigger one (page reload or fresh login)
          autoTriggered = true;
          try {
            const triggerRes = await fetch("/api/sync/trigger", { method: "POST" });
            if (triggerRes.ok) {
              const triggerData = await triggerRes.json();
              setSync({ status: "running", progress: 0 });
              startPolling();
            }
          } catch {
            // Silently fail — user can trigger manually
          }
        }
      })
      .catch(() => {});
    return stopPolling;
  }, []);

  if (collapsed) {
    return (
      <div className="py-2">
        {sync.status === "running" ? (
          <div
            className="relative flex items-center justify-center w-full px-3 py-2 rounded-[6px] border border-accent/30 overflow-hidden"
            title={`Sincronizando... ${sync.progress}%`}
          >
            <div
              className="absolute inset-0 bg-accent transition-all duration-500"
              style={{ width: `${sync.progress}%` }}
            />
            <span className="relative text-[10px] font-medium text-text-primary">
              {sync.progress}%
            </span>
          </div>
        ) : sync.status === "completed" ? (
          <div
            className="relative flex items-center justify-center w-full px-3 py-2 rounded-[6px] border border-success/30 overflow-hidden"
            title="Sincronizado"
          >
            <div
              className="absolute inset-0 bg-success transition-all duration-500"
              style={{ width: "100%" }}
            />
            <svg className="relative h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        ) : (
          <button
            onClick={handleSync}
            disabled={triggering}
            title="Sincronizar datos"
            className="flex items-center justify-center w-full px-3 py-2 rounded-[6px] border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-2">
      {sync.status === "running" ? (
        <div className="relative flex items-center justify-center w-full px-3 py-2 rounded-[6px] border border-accent/30 overflow-hidden">
          <div
            className="absolute inset-0 bg-accent transition-all duration-500"
            style={{ width: `${sync.progress}%` }}
          />
          <div className="relative flex items-center justify-between w-full">
            <span className="text-[13px] font-medium leading-[18px] text-text-primary">
              Sincronizando...
            </span>
            <span className="text-[13px] font-medium leading-[18px] text-text-primary">
              {sync.progress}%
            </span>
          </div>
        </div>
      ) : sync.status === "completed" ? (
        <div className="relative flex items-center justify-center w-full px-3 py-2 rounded-[6px] border border-success/30 overflow-hidden">
          <div
            className="absolute inset-0 bg-success transition-all duration-500"
            style={{ width: "100%" }}
          />
          <div className="relative flex items-center justify-between w-full">
            <span className="text-[13px] font-medium leading-[18px] text-text-primary">
              Sincronizado
            </span>
            <span className="text-[13px] font-medium leading-[18px] text-text-primary">
              100%
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSync}
          disabled={triggering}
          className="flex items-center justify-start gap-2 w-full px-3 py-2 rounded-[6px] border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer disabled:opacity-50 text-[13px] font-medium leading-[18px]"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {triggering ? "Iniciando..." : "Sincronizar"}
        </button>
      )}
      {sync.status === "error" && (
        <p className="text-[10px] leading-[14px] text-danger-text mt-1">Error en la sincronización</p>
      )}
    </div>
  );
}

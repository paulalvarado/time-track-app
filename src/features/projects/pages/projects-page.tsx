import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui";
import { PageHeader } from "../../../components/page-header";

type Project = {
  odooId: number;
  name: string;
  color?: number | null;
  isMine?: boolean;
  ownerName?: string | null;
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

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSyncRef = useRef<string | null>(null);

  const fetchProjects = async () => {
    const res = await fetch("/api/sync/projects");
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const projData = await fetchProjects();
        setProjects(sortProjects(projData.projects || []));
        if (projData.lastSyncAt) lastSyncRef.current = projData.lastSyncAt;
      } catch {
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    };
    loadInitial();

    const interval = setInterval(async () => {
      try {
        const since = lastSyncRef.current ? `since=${encodeURIComponent(lastSyncRef.current)}` : "";
        const params = since ? `?${since}` : "";
        const res = await fetch(`/api/sync/projects${params}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.lastSyncAt) lastSyncRef.current = data.lastSyncAt;
        if (data.changed && data.changed.length > 0) {
          setProjects(prev => {
            const map = new Map(prev.map(p => [p.odooId, p]));
            for (const c of data.changed) map.set(c.odooId, c);
            return sortProjects([...map.values()]);
          });
        }
      } catch {}
    }, 10_000);

    return () => clearInterval(interval);
  }, [navigate]);

  const sortProjects = (projects: Project[]) => {
    return [...projects].sort((a, b) => {
      if (a.isMine && !b.isMine) return -1;
      if (!a.isMine && b.isMine) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-page">
        <div className="mx-auto max-w-[1200px] px-6 py-20 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[14px] text-text-muted">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page">
      <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
        <PageHeader
          title="Proyectos."
          description={projects.length > 0
            ? `Tienes ${projects.length} proyecto${projects.length === 1 ? "" : "s"} sincronizado${projects.length === 1 ? "" : "s"} de Odoo.`
            : "Aún no hay proyectos sincronizados."}
          breadcrumbs={[{ label: "Proyectos" }]}
        />

        {projects.length === 0 ? (
          <div className="rounded-[12px] border border-border bg-card p-12 text-center shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold leading-[24px] text-text-primary">Sin proyectos a�n</h2>
            <p className="mt-1 text-[14px] leading-[20px] text-text-secondary max-w-sm mx-auto">
              Conecta tu instancia de Odoo y sincroniza tus proyectos para empezar a registrar tiempo.
            </p>
            <Link to="/settings">
              <Button size="md" className="mt-4">Conectar Odoo</Button>
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
                          Mío
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-medium leading-[20px] text-text-primary line-clamp-2">{project.name}</p>
                    <p className="mt-1 text-[12px] leading-[16px] text-text-muted">
                      {project.ownerName ?? `Dueño #${project.odooId}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

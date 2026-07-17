import { useState, useEffect } from "react";
import { DatePicker, Button, SelectMenu, RadioGroup } from "../../../components/ui";
import { PageHeader } from "../../../components/page-header";
import { useSetBreadcrumb } from "../../../components/breadcrumb-context";
import { useNavigate } from "@tanstack/react-router";

/* ─── Types ─── */

type ReportEntry = {
  date: string;
  description: string;
  hours: number;
};

type ReportTask = {
  name: string;
  totalHours: number;
  entries: ReportEntry[];
};

type ReportProject = {
  name: string;
  totalHours: number;
  tasks: ReportTask[];
};

type ReportEmployee = {
  name: string;
  totalHours: number;
  projects: ReportProject[];
};

type ReportData = {
  groups: ReportEmployee[] | ReportProject[];
  totalHours: number;
  dateFrom: string;
  dateTo: string;
  groupBy: string;
};

/* ─── Helpers ─── */

function formatHours(h: number): string {
  const totalMinutes = Math.round(h * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatDate(d: string): string {
  if (!d) return "-";
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getMonthLabel(d: string): string {
  if (!d) return "";
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

function groupEntriesByMonth(entries: ReportEntry[]): Record<string, ReportEntry[]> {
  const months: Record<string, ReportEntry[]> = {};
  for (const e of entries) {
    const key = e.date ? e.date.substring(0, 7) : "unknown";
    if (!months[key]) months[key] = [];
    months[key].push(e);
  }
  return months;
}

/* ─── Component ─── */

export function HoursReportPage() {
  const navigate = useNavigate();

  useSetBreadcrumb([
    { label: "Horas", to: "/admin/hours" },
    { label: "Reporte" },
  ]);

  const [dateFrom, setDateFrom] = useState("2026-06-01");
  const [dateTo, setDateTo] = useState("2026-07-31");
  const [groupBy, setGroupBy] = useState<"employee_project_task" | "project_employee_task">("employee_project_task");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filtros de empleado y proyecto
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  // Cargar opciones de filtros
  useEffect(() => {
    fetch("/api/admin/timesheets/filters")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setEmployees(data.employees ?? []);
        setProjects(data.projects ?? []);
      })
      .catch(() => {});
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const params = new URLSearchParams({ dateFrom, dateTo, groupBy });
      if (selectedEmployee) params.set("employeeId", selectedEmployee);
      if (selectedProject) params.set("projectId", selectedProject);
      const res = await fetch(`/api/admin/timesheets/report?${params}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al obtener el reporte");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const params = new URLSearchParams({ dateFrom, dateTo, groupBy });
    if (selectedEmployee) params.set("employeeId", selectedEmployee);
    if (selectedProject) params.set("projectId", selectedProject);
    window.open(`/api/admin/timesheets/report?${params}&format=xlsx`, "_blank");
  };

  const isEmployeeGroup = groupBy === "employee_project_task";

  return (
    <main className="min-h-screen bg-page overflow-x-hidden">
      <div className="w-full max-w-full px-6 py-8 space-y-6">
        <PageHeader
          title="Reporte de partes de horas."
          description="Visualiza y exporta las horas registradas con filtros y agrupaciones."
        />

        {/* Filters */}
        <div className="rounded-[8px] border border-border bg-card p-6 space-y-6">
          {/* Row 1: 4 selectors */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-[13px] font-medium leading-[18px] text-text-primary mb-1.5">Fecha desde</p>
              <DatePicker value={dateFrom} onChange={setDateFrom} wrapperClassName="w-full" />
            </div>
            <div>
              <p className="text-[13px] font-medium leading-[18px] text-text-primary mb-1.5">Fecha hasta</p>
              <DatePicker value={dateTo} onChange={setDateTo} wrapperClassName="w-full" />
            </div>
            <div>
              <p className="text-[13px] font-medium leading-[18px] text-text-primary mb-1.5">Empleado</p>
              <SelectMenu
                placeholder="Todos los empleados"
                options={[
                  { value: "", label: "Todos los empleados" },
                  ...employees.map((e) => ({ value: String(e.id), label: e.name })),
                ]}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
              />
            </div>
            <div>
              <p className="text-[13px] font-medium leading-[18px] text-text-primary mb-1.5">Proyecto</p>
              <SelectMenu
                placeholder="Todos los proyectos"
                options={[
                  { value: "", label: "Todos los proyectos" },
                  ...projects.map((p) => ({ value: String(p.id), label: p.name })),
                ]}
                value={selectedProject}
                onChange={setSelectedProject}
              />
            </div>
          </div>

          {/* Row 2: Grouping */}
          <div>
            <p className="text-[13px] font-medium leading-[18px] text-text-primary mb-1.5">Agrupar por</p>
            <RadioGroup
              name="groupBy"
              value={groupBy}
              onChange={(v) => setGroupBy(v as "employee_project_task" | "project_employee_task")}
              options={[
                { value: "employee_project_task", label: "Programador → Proyecto → Tarjeta" },
                { value: "project_employee_task", label: "Proyecto → Programador → Tarjeta" },
              ]}
            />
          </div>

          {/* Row 3: Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Cargando..." : "VER EN PANTALLA"}
            </Button>
            <Button variant="secondary" onClick={downloadExcel} disabled={!data}>
              DESCARGAR EXCEL
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/admin/hours" })}
            >
              CERRAR
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-4 py-3 text-[13px] leading-[18px] text-danger-text">
            {error}
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-[14px] text-text-muted">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando reporte...
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="rounded-[8px] border border-border bg-card overflow-hidden w-full min-w-0">
            {/* Total header */}
            <div className="px-6 py-4 border-b border-border bg-surface/50">
              <p className="text-[14px] text-text-secondary">
                Total general:{" "}
                <span className="font-semibold text-text-primary">
                  {formatHours(data.totalHours)} horas
                </span>
              </p>
            </div>

            {/* Groups */}
            <div className="divide-y divide-border">
              {(data.groups as any[]).map((group, gi) => (
                <GroupSection
                  key={gi}
                  group={group}
                  isEmployeeGroup={isEmployeeGroup}
                  formatHours={formatHours}
                  formatDate={formatDate}
                  groupEntriesByMonth={groupEntriesByMonth}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ─── Sub-components ─── */

function GroupSection({
  group,
  isEmployeeGroup,
  formatHours,
  formatDate,
  groupEntriesByMonth,
}: {
  group: any;
  isEmployeeGroup: boolean;
  formatHours: (h: number) => string;
  formatDate: (d: string) => string;
  groupEntriesByMonth: (entries: ReportEntry[]) => Record<string, ReportEntry[]>;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = isEmployeeGroup ? group.projects : group.employees;

  return (
    <div>
      {/* Group header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-surface/30 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className={`h-4 w-4 text-text-muted shrink-0 transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-[14px] font-medium text-text-primary truncate min-w-0">{group.name}</span>
        </div>
        <span className="text-[13px] font-medium text-text-primary tabular-nums">
          {formatHours(group.totalHours)}
        </span>
      </button>

      {/* Children */}
      {expanded && children && (
        <div className="border-t border-border bg-surface/20 divide-y divide-border">
          {(children as any[]).map((child, ci) => (
            <ChildSection
              key={ci}
              child={child}
              isEmployeeGroup={isEmployeeGroup}
              formatHours={formatHours}
              formatDate={formatDate}
              depth={1}
              groupEntriesByMonth={groupEntriesByMonth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChildSection({
  child,
  isEmployeeGroup,
  formatHours,
  formatDate,
  depth,
  groupEntriesByMonth,
}: {
  child: any;
  isEmployeeGroup: boolean;
  formatHours: (h: number) => string;
  formatDate: (d: string) => string;
  depth: number;
  groupEntriesByMonth: (entries: ReportEntry[]) => Record<string, ReportEntry[]>;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const subChildren = isEmployeeGroup
    ? depth === 0
      ? child.projects
      : depth === 1
        ? child.tasks
        : null
    : depth === 0
      ? child.employees
      : depth === 1
        ? child.tasks
        : null;

  const hasChildren = subChildren && subChildren.length > 0;
  const isTask = depth >= 2 || (isEmployeeGroup ? depth === 1 ? !hasChildren : depth >= 1 : depth === 1 ? !hasChildren : depth >= 1);

  if (child.entries) {
    // Task level with entries
    const months = groupEntriesByMonth(child.entries);

    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-surface/30 transition-colors cursor-pointer text-left"
          style={{ paddingLeft: `${20 + depth * 24}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren && (
              <svg
                className={`h-3 w-3 text-text-muted shrink-0 transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            )}
            {!hasChildren && <span className="w-3 shrink-0" />}
            <span className="text-[13px] text-text-primary truncate min-w-0">{child.name}</span>
          </div>
          <span className="text-[13px] font-medium text-text-primary tabular-nums shrink-0 ml-4">
            {formatHours(child.totalHours)}
          </span>
        </button>

        {expanded && (
          <div className="border-t border-border/50">
            {Object.entries(months).map(([monthKey, monthEntries]) => (
              <div key={monthKey}>
                <p
                  className="px-6 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-muted bg-surface/30"
                  style={{ paddingLeft: `${36 + depth * 24}px` }}
                >
                  {getMonthLabel(monthEntries[0]?.date || "")}
                </p>
                <div className="divide-y divide-border/30">
                  {monthEntries.map((entry, ei) => (
                    <div
                      key={ei}
                      className="flex items-center justify-between px-6 py-1.5"
                      style={{ paddingLeft: `${36 + depth * 24}px` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[12px] text-text-muted tabular-nums w-20 shrink-0">
                          {formatDate(entry.date)}
                        </span>
                        <span className="text-[12px] text-text-secondary truncate min-w-0">
                          {entry.description || "-"}
                        </span>
                      </div>
                      <span className="text-[12px] text-text-primary tabular-nums shrink-0 ml-4">
                        {formatHours(entry.hours)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Not task level - has sub-children
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-surface/30 transition-colors cursor-pointer text-left"
        style={{ paddingLeft: `${20 + depth * 24}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {hasChildren && (
            <svg
              className={`h-3 w-3 text-text-muted shrink-0 transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          )}
          {!hasChildren && <span className="w-3 shrink-0" />}
          <span className="text-[13px] text-text-primary truncate min-w-0">{child.name}</span>
        </div>
        <span className="text-[13px] font-medium text-text-primary tabular-nums shrink-0 ml-4">
          {formatHours(child.totalHours)}
        </span>
      </button>

      {expanded && subChildren && (
        <div className="border-t border-border/50 divide-y divide-border/30">
          {subChildren.map((sub: any, si: number) => (
            <ChildSection
              key={si}
              child={sub}
              isEmployeeGroup={isEmployeeGroup}
              formatHours={formatHours}
              formatDate={formatDate}
              depth={depth + 1}
              groupEntriesByMonth={groupEntriesByMonth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

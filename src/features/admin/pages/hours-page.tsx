import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SelectMenu, Button, Dropdown, DropdownItem } from "../../../components/ui";
import { PageHeader } from "../../../components/page-header";
import { useSetBreadcrumb } from "../../../components/breadcrumb-context";
import { DataTable, type Column } from "../components/DataTable";

type Timesheet = {
  id: string;
  description: string;
  hours: number;
  date: string;
  taskId: number | null;
  taskName: string;
  projectId: number | null;
  projectName: string;
  employeeId: number | null;
  employeeName: string;
};

type FilterOption = {
  id: number;
  name: string;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function getStoredPageSize(): number {
  try {
    const stored = localStorage.getItem("hoursPageSize");
    if (stored && PAGE_SIZE_OPTIONS.includes(parseInt(stored, 10))) {
      return parseInt(stored, 10);
    }
  } catch {}
  return 20;
}

const COLUMNS: Column<Timesheet>[] = [
  { key: "date", label: "Fecha" },
  { key: "employee", label: "Empleado" },
  { key: "project", label: "Proyecto" },
  { key: "task", label: "Tarea" },
  { key: "description", label: "Descripción" },
  { key: "hours", label: "Horas", className: "text-right" },
];

export function HoursPage() {
  const navigate = useNavigate();

  useSetBreadcrumb([{ label: "Horas" }]);

  const [period, setPeriod] = useState("week");
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [employees, setEmployees] = useState<FilterOption[]>([]);
  const [projects, setProjects] = useState<FilterOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  // Paginación
  const [pageSize, setPageSize] = useState(getStoredPageSize);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Resetear página cuando cambian los filtros o el tamaño de página
  useEffect(() => {
    setPage(0);
  }, [period, selectedEmployee, selectedProject, pageSize]);

  // Descargar exportación
  function downloadExport(format: 'xlsx' | 'csv') {
    const params = new URLSearchParams({ format, period });
    if (selectedEmployee) params.set('employeeId', selectedEmployee);
    if (selectedProject) params.set('projectId', selectedProject);

    const url = `/api/admin/timesheets/export?${params}`;
    window.open(url, '_blank');
  }

  // Refs para el indicador deslizante
  const indicatorRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function positionIndicator(p: string) {
    const indicator = indicatorRef.current;
    const btn = btnRefs.current[p];
    if (!indicator || !btn?.parentElement) return;
    const cr = btn.parentElement.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    indicator.style.left = br.left - cr.left + "px";
    indicator.style.width = br.width + "px";
  }

  useEffect(() => {
    positionIndicator(period);
  });

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

  // Cargar timesheets
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ period, page: String(page), pageSize: String(pageSize) });
    if (selectedEmployee) params.set("employeeId", selectedEmployee);
    if (selectedProject) params.set("projectId", selectedProject);

    fetch(`/api/admin/timesheets?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setTimesheets(data.timesheets ?? []);
        setTotalCount(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => {
        setTimesheets([]);
        setTotalCount(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [period, selectedEmployee, selectedProject, page, pageSize]);

  // Cargar total de horas (solo cuando cambian filtros, no la página)
  useEffect(() => {
    const params = new URLSearchParams({ period });
    if (selectedEmployee) params.set("employeeId", selectedEmployee);
    if (selectedProject) params.set("projectId", selectedProject);

    fetch(`/api/admin/timesheets?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setTotalHours(data.totalHours ?? 0);
      })
      .catch(() => {
        setTotalHours(0);
      });
  }, [period, selectedEmployee, selectedProject]);

  const periods = [
    { key: "day", label: "Día" },
    { key: "week", label: "Semana" },
    { key: "month", label: "Mes" },
    { key: "year", label: "Año" },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHours = (h: number) => {
    return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
  };

  const renderRow = (ts: Timesheet) => (
    <tr
      key={ts.id}
      className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
    >
      <td className="px-5 py-3 text-[13px] text-text-primary whitespace-nowrap">
        {formatDate(ts.date)}
      </td>
      <td className="px-5 py-3 text-[13px] text-text-primary">
        {ts.employeeName}
      </td>
      <td className="px-5 py-3 text-[13px] text-text-primary">
        {ts.projectName}
      </td>
      <td className="px-5 py-3 text-[13px] text-text-primary max-w-[200px] truncate">
        {ts.taskName}
      </td>
      <td className="px-5 py-3 text-[13px] text-text-secondary max-w-[250px] truncate">
        {ts.description || "-"}
      </td>
      <td className="px-5 py-3 text-[13px] text-text-primary font-medium text-right whitespace-nowrap">
        {formatHours(ts.hours)}
      </td>
    </tr>
  );

  return (
    <main className="min-h-screen bg-page overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
        <PageHeader
          title="Horas."
          description="Todas las partes de horas registradas en el sistema."
        />

        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <div
            className="relative inline-flex rounded-[8px] bg-surface p-0.5"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <div
              ref={indicatorRef}
              className="absolute top-0.5 bottom-0.5 rounded-[6px] bg-card transition-all duration-200 ease-out"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
            />
            {periods.map((p) => (
              <button
                key={p.key}
                ref={(el) => {
                  btnRefs.current[p.key] = el;
                }}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`relative z-10 px-3 py-1.5 text-[13px] font-medium leading-[18px] transition-colors duration-150 cursor-pointer ${
                  period === p.key
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Total hours badge */}
          <div className="flex items-center gap-2 text-[14px] text-text-secondary">
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>
              Total: <strong className="text-text-primary">{formatHours(totalHours)}</strong>
            </span>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-4">
          <div className="w-56">
            <SelectMenu
              placeholder="Todos los empleados"
              options={[
                { value: "", label: "Todos los empleados" },
                ...employees.map((e) => ({
                  value: String(e.id),
                  label: e.name,
                })),
              ]}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
            />
          </div>
          <div className="w-56">
            <SelectMenu
              placeholder="Todos los proyectos"
              options={[
                { value: "", label: "Todos los proyectos" },
                ...projects.map((p) => ({
                  value: String(p.id),
                  label: p.name,
                })),
              ]}
              value={selectedProject}
              onChange={setSelectedProject}
            />
          </div>

          {/* Report button */}
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate({ to: "/admin/hours/report" })}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Reporte
            </Button>

            {/* Export button */}
            <Dropdown
              trigger={
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Excel
                  <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </Button>
              }
              align="end"
            >
              <DropdownItem
                onClick={() => downloadExport('xlsx')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Excel (.xlsx)
              </DropdownItem>
              <DropdownItem
                onClick={() => downloadExport('csv')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                CSV (.csv)
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* DataTable: tabla skeleton + datos + paginación */}
        <DataTable<Timesheet>
          columns={COLUMNS}
          data={timesheets}
          loading={loading}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          storageKey="hoursPageSize"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          renderRow={renderRow}
          emptyMessage="No hay partes de horas registradas en este período."
          emptyDescription="Intenta cambiar el filtro a un rango más amplio."
        />
      </div>
    </main>
  );
}

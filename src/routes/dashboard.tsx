import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Card, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, SelectMenu, Label } from "../components/ui";
import { useDarkMode } from "../lib/use-dark-mode";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
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

function StatLoader({ loaded, value }: { loaded: boolean; value: string }) {
  const [phase, setPhase] = useState<"bouncing" | "collapsing" | "value">("bouncing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loaded && phase === "bouncing") {
      setPhase("collapsing");
      timerRef.current = setTimeout(() => setPhase("value"), 400);
    }
  }, [loaded, phase]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const containerStyle: React.CSSProperties = { height: "32px", lineHeight: "32px" };

  if (phase === "value") {
    return (
      <span className="inline-block align-middle" style={{ ...containerStyle, animation: "value-fade-in 0.3s ease-out" }}>
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-[3px] align-middle" style={containerStyle}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-[5px] h-[5px] rounded-full bg-text-primary"
          style={
            phase === "bouncing"
              ? { animation: `dot-jump 1s ease-in-out ${i * 0.18}s infinite` }
              : {
                  animation: `dot-collapse 0.35s ease-in-out ${i * 0.06}s forwards`,
                  "--dx": `${(i - 1) * 6}px`,
                  "--dy": `${-10}px`,
                } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const confirmLogout = useDialog();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [odooStatus, setOdooStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [savedEmployeeOdooId, setSavedEmployeeOdooId] = useState<number | null>(null);
  const [tsDialogOpen, setTsDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: number; name: string; userId: number | null }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  // Derive the pre-selected value from savedEmployeeOdooId whenever employees change
  const effectiveEmployeeId = selectedEmployeeId || (savedEmployeeOdooId && employees.length > 0
    ? (() => {
        const match = employees.find((e) => e.id === savedEmployeeOdooId);
        return match ? String(match.id) : "";
      })()
    : "");

  const [tsLoading, setTsLoading] = useState(false);
  const [tsFetching, setTsFetching] = useState(false);
  const [period, setPeriod] = useState("year");
  const periodRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [periodIndicator, setPeriodIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (!data.user.hasOdooConfig) {
            navigate({ to: "/settings" });
            return;
          }
        }
      })
      .catch(() => {
        navigate({ to: "/login" });
      });
  }, [navigate]);

  useEffect(() => {
    if (sessionStorage.getItem("welcome") === "true") {
      sessionStorage.removeItem("welcome");
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 2500);
    }
  }, []);

  useEffect(() => {
    // Fetch KPI employee ID from user metadata
    fetch("/api/user/metadata/kpi_employee_id")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.value && data.value.employeeOdooId) {
          setSavedEmployeeOdooId(data.value.employeeOdooId);
        }
      })
      .catch(() => {});

    // Fetch other data in parallel
    Promise.all([
      fetch("/api/odoo/test", { method: "POST" }),
      fetch("/api/projects/count"),
    ])
      .then(async ([testRes, projRes]) => {
        try {
          const testData = await testRes.json();
          setOdooStatus(testData.connected ? "connected" : "disconnected");
        } catch { setOdooStatus("disconnected"); }

        try {
          const projData = await projRes.json();
          setTotalProjects(projData.total ?? 0);
        } catch { setTotalProjects(0); }
      })
      .catch(() => {});
  }, []);

  // Fetch total hours from local DB when employee or period changes
  useEffect(() => {
    if (!savedEmployeeOdooId) {
      setTotalHours(0);
      return;
    }
    fetch(`/api/sync/hours-by-employee/${savedEmployeeOdooId}?period=${period}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setTotalHours(data.totalHours ?? 0);
      })
      .catch(() => setTotalHours(0));
  }, [savedEmployeeOdooId, period]);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    navigate({ to: "/login" });
  };

  const handlePeriodChange = useCallback((p: string) => {
    setPeriod(p);
    const el = periodRefs.current[p];
    if (el && el.parentElement) {
      const parent = el.parentElement.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setPeriodIndicator({ left: rect.left - parent.left, width: rect.width });
    }
  }, []);

  // Init indicator position on mount / when period changes from outside
  useEffect(() => {
    const el = periodRefs.current[period];
    if (el && el.parentElement) {
      const parent = el.parentElement.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setPeriodIndicator({ left: rect.left - parent.left, width: rect.width });
    }
  }, [period]);

  const handleOpenTimesheet = async () => {
    setSelectedEmployeeId("");
    setTsDialogOpen(true);
    setTsLoading(true);
    try {
      const res = await fetch("/api/odoo/employees");
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
    } catch {}
    setTsLoading(false);
  };

  const handleEmployeeChange = async (val: string) => {
    if (!val) return;
    setTsFetching(true);
    const selected = employees.find((e) => String(e.id) === val);
    if (!selected) return;
    try {
      await fetch("/api/user/metadata/kpi_employee_id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: { employeeOdooId: selected.id },
        }),
      });
      setSavedEmployeeOdooId(selected.id);
    } catch {}
    setTsFetching(false);
    setTsDialogOpen(false);
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex items-center gap-2 text-[14px] text-text-muted">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </div>
      </main>
    );
  }

  const odooValue = odooStatus === "loading" ? "..." : odooStatus === "connected" ? "Sí" : "No";

  const stats = [
    { label: "Total Proyectos", value: totalProjects !== null ? String(totalProjects) : "...", icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" },
    { label: "Horas Registradas", value: totalHours !== null ? `${Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)}h` : "...", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
    { label: "Odoo Conectado", value: odooValue, icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" },
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
            <p className="text-[13px] font-medium leading-[18px] text-text-primary">¡Bienvenido, {user.name.split(" ")[0]}!</p>
            <p className="text-[12px] leading-[16px] text-text-muted">Has iniciado sesión.</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Bienvenido de nuevo, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            Aquí tienes un resumen de tu actividad.
          </p>
        </div>

        {/* Period Selector */}
        <div className="relative inline-flex rounded-[8px] bg-surface p-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
          {/* Sliding indicator */}
          <div
            className="absolute top-0.5 bottom-0.5 rounded-[6px] bg-card transition-all duration-200 ease-out"
            style={{
              left: `${periodIndicator.left}px`,
              width: `${periodIndicator.width}px`,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
            }}
          />
          {["day", "week", "month", "year"].map((p) => (
            <button
              key={p}
              ref={(el) => { periodRefs.current[p] = el; }}
              type="button"
              onClick={() => handlePeriodChange(p)}
              className={`relative z-10 px-3 py-1.5 text-[13px] font-medium leading-[18px] transition-colors duration-150 cursor-pointer ${
                period === p ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {p === "day" ? "Día" : p === "week" ? "Semana" : p === "month" ? "Mes" : "Año"}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => {
            const isOdoo = s.label === "Odoo Connected";
            const isOdooLoading = isOdoo && odooStatus === "loading";
            const isOdooYes = isOdoo && odooStatus === "connected";
            return (
              <Card key={s.label} variant="default" className={s.label === "Horas Registradas" ? "cursor-pointer hover:ring-1 hover:ring-accent/50 transition-all" : ""} onClick={s.label === "Horas Registradas" ? handleOpenTimesheet : undefined}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-[6px] ${isOdooYes ? "bg-success-bg" : "bg-surface"}`}>
                    {isOdooLoading ? (
                      <svg className="h-4 w-4 text-text-muted animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className={`h-4 w-4 ${isOdooYes ? "text-success" : "text-text-primary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`text-[24px] font-semibold leading-[32px] tracking-[-0.96px] ${isOdooYes ? "text-success" : "text-text-primary"}`}>
                      {isOdooLoading ? (
                        "Verificando..."
                      ) : s.label === "Total Proyectos" ? (
                        <StatLoader loaded={totalProjects !== null} value={String(totalProjects ?? 0)} />
                      ) : s.label === "Horas Registradas" ? (
                        <StatLoader loaded={totalHours !== null} value={totalHours !== null ? `${Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)}h` : "0h"} />
                      ) : (
                        s.value
                      )}
                    </p>
                    <p className="text-[13px] leading-[18px] text-text-secondary">{s.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary mb-4">
            Acciones rápidas.
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
                    <p className="text-[14px] font-medium leading-[20px] text-text-primary group-hover:text-accent transition-colors">Conectar Odoo</p>
                    <p className="text-[13px] leading-[18px] text-text-secondary">Configura tu instancia de Odoo para sincronizar proyectos.</p>
                  </div>
                  <span className="inline-flex h-8 items-center rounded-[6px] bg-[#171717] px-3 text-[13px] font-medium leading-[20px] text-[#ffffff] group-hover:bg-[#0070f3] transition-colors">
                    Configurar
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
                    <p className="text-[14px] font-medium leading-[20px] text-text-primary group-hover:text-accent transition-colors">Ver Proyectos</p>
                    <p className="text-[13px] leading-[18px] text-text-secondary">Explora y administra tus proyectos sincronizados.</p>
                  </div>
                  <span className="inline-flex h-8 items-center rounded-[6px] bg-[#171717] px-3 text-[13px] font-medium leading-[20px] text-[#ffffff] group-hover:bg-[#0070f3] transition-colors">
                    Ver
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary mb-4">
            Actividad reciente.
          </h2>
          <Card variant="default">
            <div className="text-center py-8">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-[14px] font-medium leading-[20px] text-text-primary">Sin actividad aún</p>
              <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">Comienza conectando tu instancia de Odoo.</p>
              <Link to="/settings">
                <Button variant="primary" size="sm" className="mt-4">Conectar Odoo</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Timesheet Dialog */}
      <Dialog open={tsDialogOpen} onClose={() => { setTsDialogOpen(false); setSelectedEmployeeId(""); }}>
        <DialogHeader title="Seleccionar empleado" description={savedEmployeeOdooId ? "Empleado seleccionado actualmente. Puedes cambiarlo si lo deseas." : "Elige un empleado para ver el total de sus horas registradas en Odoo."} onClose={() => { setTsDialogOpen(false); setSelectedEmployeeId(""); }} />
        <DialogBody>
          <div className="space-y-4">
            <div>
              <Label>Empleado</Label>
              <SelectMenu
                key={employees.length}
                options={employees.map((e) => ({ value: String(e.id), label: e.name }))}
                value={effectiveEmployeeId}
                onChange={handleEmployeeChange}
                placeholder={tsLoading ? "Cargando empleados..." : "Seleccionar empleado..."}
                wrapperClassName="max-w-full" />
            </div>
            {tsFetching && (
              <div className="flex items-center justify-center py-4">
                <p className="text-[13px] leading-[18px] text-text-muted">Guardando preferencia...</p>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={() => { setTsDialogOpen(false); setSelectedEmployeeId(""); }}>Cancelar</Button>
        </DialogFooter>
      </Dialog>

      {/* Sign out confirmation dialog */}
      <Dialog open={confirmLogout.open} onClose={confirmLogout.close}>
        <DialogHeader
          title="Cerrar sesión"
          description="¿Estás seguro de que quieres cerrar sesión? Necesitarás iniciar sesión de nuevo para acceder al dashboard."
          onClose={confirmLogout.close}
        />
        <DialogBody>
          Tu sesión se cerrará y serás redirigido a la página de inicio de sesión.
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={confirmLogout.close}>Cancelar</Button>
          <Button variant="danger" size="md" onClick={handleLogout}>Cerrar sesión</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

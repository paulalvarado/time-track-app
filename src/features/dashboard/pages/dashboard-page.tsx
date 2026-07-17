import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button, Card, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, SelectMenu, Label } from "../../../components/ui";
import { useDarkMode } from "../../../hooks/use-dark-mode";

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

export function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; isAdmin?: boolean } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const confirmLogout = useDialog();
  const { isDark, toggle: toggleDark } = useDarkMode();

  // ── User state ──
  const [odooStatus, setOdooStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [savedEmployeeOdooId, setSavedEmployeeOdooId] = useState<number | null>(null);
  const [tsDialogOpen, setTsDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: number; name: string; userId: number | null }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const effectiveEmployeeId = selectedEmployeeId || (savedEmployeeOdooId && employees.length > 0
    ? (() => {
        const match = employees.find((e) => e.id === savedEmployeeOdooId);
        return match ? String(match.id) : "";
      })()
    : "");
  const [tsLoading, setTsLoading] = useState(false);
  const [tsFetching, setTsFetching] = useState(false);
  const [period, setPeriod] = useState("week");

  // ── Admin state ──
  const [adminStats, setAdminStats] = useState<{
    totalProjects: number;
    totalUsers: number;
    totalTasks: number;
    totalTimesheets: number;
    totalOdooConfigs: number;
  } | null>(null);

  // Cargar datos del usuario
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (!data.user.hasOdooConfig && !data.user.isAdmin) {
            navigate({ to: "/settings" });
            return;
          }
        }
      })
      .catch(() => {
        navigate({ to: "/login" });
      });
  }, [navigate]);

  // Si es admin, cargar stats globales
  useEffect(() => {
    if (user?.isAdmin) {
      fetch("/api/admin/stats")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed");
          const data = await res.json();
          setAdminStats(data.stats || null);
        })
        .catch(() => {});
    }
  }, [user?.isAdmin]);

  useEffect(() => {
    if (sessionStorage.getItem("welcome") === "true") {
      sessionStorage.removeItem("welcome");
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 2500);
    }
  }, []);

  // Cargar datos de usuario normal
  useEffect(() => {
    if (user?.isAdmin) return; // admin no necesita estos datos

    fetch("/api/user/metadata")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.metadata) {
          const kpiVal = data.metadata.kpi_employee_id;
          if (kpiVal && kpiVal.employeeOdooId) {
            setSavedEmployeeOdooId(kpiVal.employeeOdooId);
          }
          const savedPeriod = data.metadata.kpi_period;
          if (savedPeriod && ["day", "week", "month", "year"].includes(savedPeriod)) {
            setPeriod(savedPeriod);
          }
        }
      })
      .catch(() => {});

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
  }, [user?.isAdmin]);

  // Fetch total hours from local DB when employee or period changes
  useEffect(() => {
    if (user?.isAdmin || !savedEmployeeOdooId) {
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
  }, [savedEmployeeOdooId, period, user?.isAdmin]);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    navigate({ to: "/login" });
  };

  // Refs para el indicador y los botones
  const indicatorRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Mover indicador al botón activo
  function positionIndicator(p: string) {
    const indicator = indicatorRef.current;
    const btn = btnRefs.current[p];
    if (!indicator || !btn?.parentElement) return;
    const cr = btn.parentElement.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    indicator.style.left = (br.left - cr.left) + 'px';
    indicator.style.width = br.width + 'px';
  }

  // Efecto: siempre que cambie el período, mover indicador
  useEffect(() => {
    positionIndicator(period);
  });

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    fetch("/api/user/metadata/kpi_period", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: p }),
    }).catch(() => {});
  };

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

  const isAdmin = user?.isAdmin ?? false;
  const odooValue = odooStatus === "loading" ? "..." : odooStatus === "connected" ? "Sí" : "No";

  // Stats para usuario normal
  const userStats = [
    { label: "Total Proyectos", value: totalProjects !== null ? String(totalProjects) : "...", icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" },
    { label: "Horas Registradas", value: totalHours !== null ? `${Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)}h` : "...", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
    { label: "Odoo Conectado", value: odooValue, icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" },
  ];

  // Stats para admin (desde BD local)
  const adminStatCards = adminStats ? [
    { label: "Total Proyectos", value: String(adminStats.totalProjects), icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z", color: "text-accent" },
    { label: "Usuarios", value: String(adminStats.totalUsers), icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
    { label: "Tareas", value: String(adminStats.totalTasks), icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" },
    { label: "Partes de Hora", value: String(adminStats.totalTimesheets), icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
    { label: "Conexiones Odoo", value: String(adminStats.totalOdooConfigs), icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" },
  ] : [];

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
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
              {isAdmin ? "Panel de Administración." : `Bienvenido de nuevo, ${user.name.split(" ")[0]}.`}
            </h1>
            {isAdmin && (
              <span className="rounded-[4px] bg-accent/10 border border-accent/20 px-1.5 py-0.5 text-[11px] font-medium text-accent leading-[14px]">
                admin
              </span>
            )}
          </div>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            {isAdmin
              ? "Resumen global del sistema. Todos los datos provienen de la base local."
              : "Aquí tienes un resumen de tu actividad."}
          </p>
        </div>

        {isAdmin ? (
          /* ── Admin Dashboard ── */
          <>
            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {adminStatCards.map((s) => (
                <Card key={s.label} variant="default">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-surface">
                      <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
                        <StatLoader loaded={adminStats !== null} value={s.value} />
                      </p>
                      <p className="text-[13px] leading-[18px] text-text-secondary">{s.label}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Admin Quick Actions */}
            <div>
              <h2 className="text-[18px] font-semibold leading-[26px] tracking-[-0.36px] text-text-primary mb-4">
                Acciones de administración.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/admin/users" className="block no-underline group">
                  <Card variant="soft">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-card border border-border group-hover:border-accent/20 transition-colors">
                        <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium leading-[20px] text-text-primary group-hover:text-accent transition-colors">Gestionar Usuarios</p>
                        <p className="text-[13px] leading-[18px] text-text-secondary">Administra usuarios, roles y permisos del sistema.</p>
                      </div>
                      <span className="inline-flex h-8 items-center rounded-[6px] bg-[#171717] px-3 text-[13px] font-medium leading-[20px] text-[#ffffff] group-hover:bg-[#0070f3] transition-colors">
                        Ir al panel
                      </span>
                    </div>
                  </Card>
                </Link>
                <Link to="/projects" className="block no-underline group">
                  <Card variant="soft">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-card border border-border group-hover:border-accent/20 transition-colors">
                        <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium leading-[20px] text-text-primary group-hover:text-accent transition-colors">Ver Proyectos</p>
                        <p className="text-[13px] leading-[18px] text-text-secondary">Explora todos los proyectos sincronizados del sistema.</p>
                      </div>
                      <span className="inline-flex h-8 items-center rounded-[6px] bg-[#171717] px-3 text-[13px] font-medium leading-[20px] text-[#ffffff] group-hover:bg-[#0070f3] transition-colors">
                        Ver
                      </span>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* ── User Dashboard ── */
          <>
            {/* Period Selector */}
            <div className="relative inline-flex rounded-[8px] bg-surface p-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
              <div
                ref={indicatorRef}
                className="absolute top-0.5 bottom-0.5 rounded-[6px] bg-card transition-all duration-200 ease-out"
                style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
              />
              {["day", "week", "month", "year"].map((p) => (
                <button
                  key={p}
                  ref={(el) => { btnRefs.current[p] = el; }}
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

            {/* User Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {userStats.map((s) => {
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
                        <p className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
                          <StatLoader loaded={s.value !== "..." && s.value !== "..."} value={s.value} />
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-card border border-border">
                        <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-card border border-border">
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
              <Card variant="ghost" className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <p className="text-[14px] text-text-secondary">Sin actividad aún</p>
                  <p className="text-[13px] text-text-muted">Comienza conectando tu instancia de Odoo.</p>
                  <Link to="/settings">
                    <Button size="sm">Conectar Odoo</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* ── Employee Selector Dialog ── */}
      <Dialog open={tsDialogOpen} onClose={() => setTsDialogOpen(false)}>
        <DialogHeader title="Seleccionar empleado" onClose={() => setTsDialogOpen(false)} />
        <DialogBody>
          {tsLoading ? (
            <p className="text-text-secondary text-[14px]">Cargando empleados...</p>
          ) : (
            <SelectMenu
              label="Empleado"
              placeholder="Selecciona un empleado..."
              options={employees.map((e) => ({ value: String(e.id), label: e.name }))}
              value={effectiveEmployeeId}
              onChange={handleEmployeeChange}
              disabled={tsFetching}
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setTsDialogOpen(false)}>Cancelar</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

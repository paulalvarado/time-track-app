import { Link, useLocation } from "@tanstack/react-router";
import { useDarkMode } from "../hooks/use-dark-mode";
import { LogoSvg } from "./logo";
import { SyncStatus } from "./sync-status";

type User = { name: string; email: string; isAdmin?: boolean };

export function Sidebar({
  user,
  onLogout,
  collapsed,
  onToggle,
}: {
  user: User;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const { pathname } = location;

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-card border-r border-border flex flex-col transition-[width] duration-200 ${
        collapsed ? "w-[64px]" : "w-[240px]"
      }`}
    >
      {/* Logo / Toggle */}
      <div className="px-5 h-16 flex items-center border-b border-border">
        {collapsed ? (
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-6 h-6 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Expandir sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        ) : (
          <>
            <button
              onClick={onToggle}
              className="flex items-center gap-2.5 no-underline flex-1 min-w-0 cursor-pointer"
              title="Colapsar sidebar"
            >
              <LogoSvg size={22} />
              <span className="text-[15px] font-semibold text-text-primary">Time Track</span>
            </button>
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-6 h-6 text-text-muted hover:text-text-secondary transition-colors cursor-pointer shrink-0"
              title="Colapsar sidebar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            General
          </p>
        )}

        <SidebarLink
          to={user.isAdmin ? "/admin/dashboard" : "/dashboard"}
          isActive={
            user.isAdmin
              ? pathname === "/admin/dashboard"
              : pathname === "/dashboard"
          }
          collapsed={collapsed}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
        >
          Dashboard
        </SidebarLink>

        <SidebarLink
          to={user.isAdmin ? "/admin/projects" : "/projects"}
          isActive={
            pathname === "/projects" ||
            pathname.startsWith("/projects/") ||
            pathname.startsWith("/admin/projects")
          }
          collapsed={collapsed}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
        >
          Proyectos
        </SidebarLink>

        <SidebarLink
          to={user.isAdmin ? "/admin/settings" : "/settings"}
          isActive={
            user.isAdmin
              ? pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")
              : pathname === "/settings" || pathname.startsWith("/settings/")
          }
          collapsed={collapsed}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          Configuración
        </SidebarLink>

        {user.isAdmin && (
          <>
            {collapsed ? (
              <div className="pt-3 pb-3 flex justify-center">
                <div className="w-6 h-px bg-text-muted/25" />
              </div>
            ) : (
              <div className="pt-4 pb-2">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                  Administración
                </p>
              </div>
            )}

            <SidebarLink
              to="/admin/hours"
              isActive={pathname === "/admin/hours"}
              collapsed={collapsed}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Horas
            </SidebarLink>
            <SidebarLink
              to="/admin/hours/report"
              isActive={pathname.startsWith("/admin/hours/report")}
              collapsed={collapsed}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              }
            >
              Reporte
            </SidebarLink>

            <SidebarLink
              to="/admin/users"
              isActive={pathname.startsWith("/admin/users")}
              collapsed={collapsed}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
            >
              Usuarios
            </SidebarLink>

            <SidebarLink
              to="/admin/roles"
              isActive={pathname.startsWith("/admin/roles")}
              collapsed={collapsed}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
            >
              Roles
            </SidebarLink>
          </>
        )}
      </nav>

      {/* Bottom section: theme + user */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="flex items-center justify-start gap-2 w-full px-3 py-2 rounded-[6px] border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={isDark ? "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" : "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"} />
          </svg>
          {!collapsed && (
            <span className="text-[13px] font-medium leading-[18px]">
              {isDark ? "Modo claro" : "Modo oscuro"}
            </span>
          )}
        </button>

        {/* Sync status */}
        <SyncStatus collapsed={collapsed} />

        {/* User info + logout */}
        {collapsed ? (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex items-center justify-center w-full px-3 py-2 rounded-[6px] border border-border text-text-secondary hover:text-danger hover:bg-danger-bg/40 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-[6px] hover:bg-surface transition-colors group">
            <Link
              to={user.isAdmin ? "/admin/settings/profile" : "/settings/profile"}
              className="flex items-center gap-2.5 min-w-0 flex-1 no-underline"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-medium text-text-secondary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-[18px] text-text-primary truncate">
                  {user.name}
                </p>
                <p className="text-[11px] leading-[16px] text-text-muted truncate">
                  {user.email}
                </p>
              </div>
            </Link>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="shrink-0 flex items-center justify-center h-7 w-7 rounded-[6px] text-text-muted hover:text-danger hover:bg-danger-bg/40 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" />
              </svg>
            </button>
        </div>
      )}
      </div>
    </aside>
  );
}

/* ─── SidebarLink ─── */

function SidebarLink({
  to,
  isActive,
  collapsed,
  icon,
  children,
}: {
  to: string;
  isActive: boolean;
  collapsed: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium leading-[18px] no-underline transition-colors ${
        isActive
          ? "text-accent bg-accent/8"
          : "text-text-secondary hover:text-text-primary hover:bg-surface"
      } ${collapsed ? "justify-center px-0" : ""}`}
      title={collapsed ? String(children) : undefined}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && children}
    </Link>
  );
}

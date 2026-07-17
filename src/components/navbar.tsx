import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Dropdown, DropdownItem, DropdownDivider } from "./ui/dropdown";
import { useDarkMode } from "../hooks/use-dark-mode";
import { LogoSvg } from "./logo";

/* ─── Public Navbar ─── */

export function PublicNavbar() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <LogoSvg />
          <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-[6px] border border-border h-9 px-4 text-[13px] font-medium leading-[18px] text-text-primary hover:bg-surface transition-colors no-underline"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-[6px] border border-transparent h-9 px-4 text-[13px] font-medium leading-[18px] text-white bg-accent hover:bg-accent-hover transition-colors no-underline"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── User Navbar (también usado por admin, varía según isAdmin) ─── */

type User = { name: string; email: string; isAdmin?: boolean };

export function UserNavbar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const { pathname } = location;

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={user.isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 no-underline">
            <LogoSvg />
            <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <NavLink to={user.isAdmin ? "/admin/dashboard" : "/dashboard"} isActive={user.isAdmin ? pathname === "/admin/dashboard" : pathname === "/dashboard"}>
            Dashboard
          </NavLink>
          <NavLink to={user.isAdmin ? "/admin/projects" : "/projects"} isActive={pathname === "/projects" || pathname.startsWith("/projects/") || pathname.startsWith("/admin/projects")}>
            Proyectos
          </NavLink>
          <NavLink to={user.isAdmin ? "/admin/settings" : "/settings"} isActive={user.isAdmin ? (pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")) : (pathname === "/settings" || pathname.startsWith("/settings/"))}>
            Configuración
          </NavLink>

          {user.isAdmin && (
            <>
              <div className="w-px h-5 bg-border mx-1" />
              <NavLink to="/admin/hours" isActive={pathname.startsWith("/admin/hours")}>
                Horas
              </NavLink>
              <NavLink to="/admin/users" isActive={pathname.startsWith("/admin/users")}>
                Usuarios
              </NavLink>
              <NavLink to="/admin/roles" isActive={pathname.startsWith("/admin/roles")}>
                Roles
              </NavLink>
            </>
          )}

          <Dropdown
            align="end"
            trigger={
              <div className="flex items-center gap-2 cursor-pointer select-none ml-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-[11px] font-medium text-text-secondary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] leading-[18px] text-text-secondary hidden sm:block">{user.name}</span>
              </div>
            }
          >
            <DropdownItem
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              }
              onClick={() => navigate({ to: user.isAdmin ? "/admin/settings/profile" : "/settings/profile" })}
            >
              Perfil
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={isDark ? "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" : "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"} />
                </svg>
              }
              onClick={toggleDark}
            >
              {isDark ? "Modo claro" : "Modo oscuro"}
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              variant="danger"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
              }
              onClick={onLogout}
            >
              Cerrar sesión
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

/* ─── NavLink ─── */

function NavLink({ to, isActive, children }: { to: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 text-[13px] font-medium leading-[18px] rounded-[6px] transition-colors no-underline ${
        isActive
          ? "text-accent bg-accent/8"
          : "text-text-secondary hover:text-text-primary hover:bg-surface"
      }`}
    >
      {children}
    </Link>
  );
}

/* ─── Logout Dialog ─── */

export function LogoutDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-[12px] bg-card p-6 shadow-[0px_8px_32px_#00000033] max-w-sm w-full mx-4">
        <h2 className="text-[18px] font-semibold leading-[26px] text-text-primary">Cerrar sesión</h2>
        <p className="mt-2 text-[14px] leading-[20px] text-text-secondary">¿Estás seguro de que quieres cerrar sesión?</p>
        <p className="mt-1 text-[13px] leading-[18px] text-text-muted">Tu sesión se cerrará.</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-[6px] border border-border h-10 px-4 text-[14px] font-medium leading-[20px] text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-[6px] border border-transparent h-10 px-4 text-[14px] font-medium leading-[20px] text-white bg-[#ee0000] hover:bg-[#cc0000] transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

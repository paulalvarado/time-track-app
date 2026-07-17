import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "../components/ui";
import { Route as publicLayout } from "../layouts/public-layout";

export const Route = createRoute({
  getParentRoute: () => publicLayout,
  path: "/",
  component: HomePage,
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

/* ─── Landing Page (not logged in) ─── */

function LandingPage() {
  return (
    <main className="min-h-screen bg-page flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-4">
          <LogoSvg />
          <span className="text-[22px] font-semibold tracking-[-0.44px] text-text-primary">Time Track</span>
        </div>
        <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-text-primary">
          Registra tu tiempo con Odoo.
        </h1>
        <p className="mt-3 text-[14px] leading-[20px] text-text-secondary">
          Gestiona y reporta tus entradas de tiempo. Integrado con Odoo para un seguimiento fluido de proyectos.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/login">
            <Button variant="secondary" size="md">Iniciar sesión</Button>
          </Link>
          <Link to="/register">
            <Button size="md">Comenzar</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ─── Home: redirect to /dashboard if authenticated, else landing ─── */

function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const u = data.user;
        if (u && !u.hasOdooConfig) {
          navigate({ to: "/settings" });
        } else if (u?.isAdmin) {
          navigate({ to: "/admin/dashboard" });
        } else {
          navigate({ to: "/dashboard" });
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
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

  return <LandingPage />;
}

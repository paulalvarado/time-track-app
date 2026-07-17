import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, Input, Label } from "../components/ui";
import { Route as publicLayout } from "../layouts/public-layout";

export const Route = createRoute({
  getParentRoute: () => publicLayout,
  path: "/admin/login",
  component: AdminLoginPage,
});

function LogoSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Si ya está autenticado como admin, redirigir al panel
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data.user?.isAdmin) {
          navigate({ to: "/admin/dashboard" });
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Inicio de sesión fallido");
        return;
      }
      if (!data.user?.isAdmin) {
        setError("Este acceso es solo para administradores.");
        return;
      }
      sessionStorage.setItem("welcome", "true");
      navigate({ to: "/admin/dashboard" });
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="text-text-secondary text-[14px]">Verificando sesión...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[12px] border border-border bg-card p-8 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
        <div className="flex items-center gap-2 mb-6">
          <LogoSvg />
          <span className="text-[18px] font-semibold leading-[24px] tracking-[-0.36px] text-text-primary">Time Track</span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Admin.
          </h1>
          <span className="rounded-[4px] bg-accent/10 border border-accent/20 px-1.5 py-0.5 text-[11px] font-medium text-accent leading-[14px]">
            admin
          </span>
        </div>
        <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
          Ingresa tu correo completo y contraseña de administrador.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Correo electrónico</Label>
            <Input
              type="email"
              placeholder="admin@timetrack.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leadingIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              }
              wrapperClassName="max-w-full"
              required
            />
          </div>

          <div>
            <Label>Contraseña</Label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onTrailingClick={() => setShowPassword(!showPassword)}
              trailingIcon={
                showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )
              }
              wrapperClassName="max-w-full"
              required
            />
          </div>

          {error && (
            <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">
              {error}
            </div>
          )}

          <Button type="submit" size="md" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Acceder al panel"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[14px] leading-[20px] text-text-secondary">
          <Link to="/login" className="text-accent hover:underline font-medium">
            Volver al inicio de sesión de usuario
          </Link>
        </p>
      </div>
    </main>
  );
}

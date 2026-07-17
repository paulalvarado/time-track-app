import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as adminSettingsLayoutRoute } from "./settings-layout";
import { useState, useEffect, useRef } from "react";
import { Button, Input, Label } from "../../components/ui";
import { Breadcrumb } from "../../components/breadcrumb";

export const Route = createRoute({
  getParentRoute: () => adminSettingsLayoutRoute,
  path: "/odoo",
  component: AdminSettingsOdooPage,
});

function AdminSettingsOdooPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const url = "https://erp.web-informatica.com";
  const dbName = "bitnami_odoo";

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/odoo/config"),
    ])
      .then(async ([userRes, configRes]) => {
        if (!userRes.ok) {
          setChecking(false);
          navigate({ to: "/login" });
          return;
        }
        const userData = await userRes.json();
        if (userData.user?.email) setUserEmail(userData.user.email);

        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) {
            setHasConfig(true);
            if (data.config.apiKey) {
              setApiKey(data.config.apiKey);
            }
          }
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));

    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/odoo/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, dbName, username: userEmail, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar la configuración");
        return;
      }
      setHasConfig(true);
      setSuccess("Configuración de Odoo guardada correctamente.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
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

  return (
    <>
      <Breadcrumb items={[{ label: "Configuración", to: "/admin/settings" }, { label: "Conexión Odoo" }]} />
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="max-w-md">
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Conexión Odoo.
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            {hasConfig
              ? "Actualiza tu conexión con Odoo."
              : "Configura tu instancia de Odoo para empezar a registrar tiempo."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>URL de Odoo</Label>
              <Input type="url" value={url} wrapperClassName="max-w-full" disabled />
              <p className="mt-1.5 text-[12px] leading-[16px] text-text-muted">Valor fijo — tu instancia de Odoo.</p>
            </div>

            <div>
              <Label>Nombre de la base de datos</Label>
              <Input type="text" value={dbName} wrapperClassName="max-w-full" disabled />
              <p className="mt-1.5 text-[12px] leading-[16px] text-text-muted">Valor fijo — base de datos de Odoo.</p>
            </div>

            <div>
              <Label>Usuario</Label>
              <Input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} wrapperClassName="max-w-full" required />
              <p className="mt-1.5 text-[12px] leading-[16px] text-text-muted">Tu correo electrónico registrado en Odoo.</p>
            </div>

            <div>
              <Label>API Key</Label>
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder={hasConfig ? "Ingresa una nueva API key para cambiarla" : "Ingresa tu API key de Odoo"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                wrapperClassName="max-w-full"
                required
                trailingIcons={[
                  {
                    icon: showApiKey ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ),
                    label: showApiKey ? "Ocultar API Key" : "Mostrar API Key",
                    onMouseDown: () => setShowApiKey(true),
                    onMouseUp: () => setShowApiKey(false),
                    onMouseLeave: () => setShowApiKey(false),
                  },
                  {
                    icon: copied ? (
                      <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                      </svg>
                    ),
                    label: "Copiar API Key",
                    onClick: () => {
                      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
                      navigator.clipboard.writeText(apiKey);
                      setCopied(true);
                      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
                    },
                  },
                ]}
              />
              <div className="mt-2 rounded-[6px] bg-surface border border-border p-3 space-y-1.5">
                <p className="text-[12px] font-semibold leading-[16px] text-text-primary">¿Cómo obtener tu API Key?</p>
                <ol className="text-[12px] leading-[16px] text-text-muted space-y-1 list-decimal pl-4">
                  <li>Inicia sesión en tu instancia de Odoo.</li>
                  <li>Ve a <span className="font-medium text-text-secondary">Ajustes → Usuarios → Tu usuario</span>.</li>
                  <li>En la pestaña <span className="font-medium text-text-secondary">Preferencias</span>, haz clic en <span className="font-medium text-text-secondary">Crear nueva API Key</span>.</li>
                  <li>Asigna un nombre descriptivo (ej. "Time Track") y presiona <span className="font-medium text-text-secondary">Generar clave</span>.</li>
                  <li>Copia la clave generada y pégala aquí.</li>
                </ol>
              </div>
            </div>

            {error && (
              <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">{error}</div>
            )}

            {success && (
              <div className="rounded-[6px] bg-info-bg border border-accent/20 px-3 py-2 text-[13px] leading-[18px] bg-info-text">{success}</div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" size="md" disabled={loading}>
                {loading ? "Guardando..." : hasConfig ? "Actualizar Odoo" : "Conectar Odoo"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

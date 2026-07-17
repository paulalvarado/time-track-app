import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as adminSettingsLayoutRoute } from "./settings-layout";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input, Label } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { useSetBreadcrumb } from "../../components/breadcrumb-context";

export const Route = createRoute({
  getParentRoute: () => adminSettingsLayoutRoute,
  path: "/ai",
  component: AdminSettingsAiPage,
});

type AiProvider = {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  docsUrl: string;
};

const PROVIDERS: AiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4-20250514",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "gemini",
    name: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.0-flash",
    docsUrl: "https://ai.google.dev/",
  },
  {
    id: "other",
    name: "Otro (BYOK)",
    baseUrl: "",
    model: "",
    docsUrl: "",
  },
];

function AdminSettingsAiPage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);
  const [loadedConfig, setLoadedConfig] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing config
  useEffect(() => {
    fetch("/api/odoo/config")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            const cfg = data.config;
            const storedProvider = cfg.aiProvider || "gemini";
            setProvider(storedProvider);
            setApiKey(cfg.aiApiKey || cfg.geminiApiKey || "");
            setBaseUrl(cfg.aiBaseUrl || "");
            setModel(cfg.aiModel || "");
            setHasConfig(!!(cfg.aiApiKey || cfg.geminiApiKey));

            // If saved provider has no url/model stored, apply defaults
            const prov = PROVIDERS.find((p) => p.id === storedProvider);
            if (prov) {
              if (!cfg.aiBaseUrl) setBaseUrl(prov.baseUrl);
              if (!cfg.aiModel) setModel(prov.model);
            }
          }
        }
        setChecking(false);
        setLoadedConfig(true);
      })
      .catch(() => {
        setChecking(false);
        setLoadedConfig(true);
      });

    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Auto-fill when provider changes (only if user hasn't manually edited)
  const handleProviderChange = useCallback((newProvider: string) => {
    setProvider(newProvider);
    const prov = PROVIDERS.find((p) => p.id === newProvider);
    if (prov) {
      setBaseUrl(prov.baseUrl);
      setModel(prov.model);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload: Record<string, any> = {
      aiProvider: provider,
      aiApiKey: apiKey,
      aiBaseUrl: baseUrl,
      aiModel: model,
    };

    try {
      // Try the generic endpoint first, fall back to gemini-key for compatibility
      const res = await fetch("/api/odoo/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setHasConfig(true);
        setSuccess("Configuración de IA guardada correctamente.");
        setTimeout(() => setSuccess(""), 3000);
        setLoading(false);
        return;
      }

      // If generic endpoint fails (404), fall back to gemini-key
      if (provider === "gemini") {
        const fallbackRes = await fetch("/api/odoo/gemini-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ geminiApiKey: apiKey }),
        });
        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok) {
          setError(fallbackData.error || "Error al guardar la clave");
          setLoading(false);
          return;
        }
        setHasConfig(fallbackData.hasGeminiKey);
        setSuccess("Clave de Gemini guardada correctamente.");
        setTimeout(() => setSuccess(""), 3000);
        setLoading(false);
        return;
      }

      const errData = await res.json();
      setError(errData.error || "Error al guardar la configuración");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey) {
      setTestResult({ ok: false, message: "Ingresa una API key primero." });
      return;
    }
    setTestResult(null);
    setTesting(true);
    try {
      const res = await fetch("/api/odoo/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiProvider: provider, aiApiKey: apiKey, aiBaseUrl: baseUrl, aiModel: model }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({ ok: true, message: data.message || "Conexión exitosa." });
      } else {
        setTestResult({ ok: false, message: data.error || "Error de conexión." });
      }
    } catch {
      setTestResult({ ok: false, message: "Error de conexión. Intenta de nuevo." });
    } finally {
      setTesting(false);
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

  const selectedProvider = PROVIDERS.find((p) => p.id === provider);

  useSetBreadcrumb([
    { label: "Configuración", to: "/admin/settings" },
    { label: "IA" },
  ]);

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <PageHeader
          title="Proveedor de IA."
          description="Configura un proveedor de IA para transcripción de voz a texto y otras funciones."
        />
        <div className="max-w-md mt-8">

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Provider selector */}
            <div>
              <Label>Proveedor</Label>
              <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`rounded-[6px] border px-3 py-2.5 text-left transition-all cursor-pointer ${
                      provider === p.id
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border bg-card text-text-secondary hover:border-text-primary/40"
                    }`}
                  >
                    <span className="text-[13px] font-medium leading-[18px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <Label>API Key</Label>
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Ingresa tu API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                wrapperClassName="max-w-full"
                required
                trailingIcons={[
                  {
                    icon: showKey ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ),
                    label: showKey ? "Ocultar API key" : "Mostrar API key",
                    onMouseDown: () => setShowKey(true),
                    onMouseUp: () => setShowKey(false),
                    onMouseLeave: () => setShowKey(false),
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
                    label: "Copiar API key",
                    onClick: () => {
                      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
                      navigator.clipboard.writeText(apiKey);
                      setCopied(true);
                      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
                    },
                  },
                ]}
              />
              {selectedProvider?.docsUrl && (
                <p className="mt-1.5 text-[12px] leading-[16px] text-text-muted">
                  Obtén tu API key en{" "}
                  <a href={selectedProvider.docsUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {selectedProvider.docsUrl}
                  </a>
                </p>
              )}
            </div>

            {/* Base URL */}
            <div>
              <Label>Base URL</Label>
              <Input
                type="url"
                placeholder="https://api.ejemplo.com/v1"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                wrapperClassName="max-w-full"
                required
              />
              <p className="mt-1.5 text-[12px] leading-[16px] text-text-muted">
                Se rellena automáticamente al seleccionar un proveedor. Puedes editarlo si es necesario.
              </p>
            </div>

            {/* Model */}
            <div>
              <Label>Modelo</Label>
              <Input
                type="text"
                placeholder="ej. gpt-4o, claude-3, gemini-pro"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                wrapperClassName="max-w-full"
                required
              />
              <p className="mt-1.5 text-[12px] leading-[16px] text-text-muted">
                Se rellena automáticamente al seleccionar un proveedor. Puedes editarlo si es necesario.
              </p>
            </div>

            {error && (
              <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">{error}</div>
            )}

            {success && (
              <div className="rounded-[6px] bg-success-bg border border-success/20 px-3 py-2 text-[13px] leading-[18px] text-success-text flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {success}
              </div>
            )}

            {testResult && (
              <div className={`rounded-[6px] border px-3 py-2 text-[13px] leading-[18px] flex items-center gap-2 ${
                testResult.ok
                  ? "bg-success-bg border-success/20 text-success-text"
                  : "bg-danger-bg border-danger/20 text-danger-text"
              }`}>
                {testResult.ok ? (
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                )}
                {testResult.message}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" size="md" disabled={loading}>
                {loading ? "Guardando..." : hasConfig ? "Actualizar configuración" : "Guardar configuración"}
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={handleTest} disabled={testing || !apiKey}>
                {testing ? "Probando..." : "Probar conexión"}
              </Button>
              {hasConfig && (
                <span className="rounded-[4px] bg-success-bg px-2 py-0.5 text-[11px] font-medium leading-[16px] text-success-text">
                  Configurado
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

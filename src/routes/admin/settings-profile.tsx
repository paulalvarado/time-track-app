import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as adminSettingsLayoutRoute } from "./settings-layout";
import { useState, useEffect } from "react";
import { Button, Input, Label, PasswordRequirements } from "../../components/ui";
import { Breadcrumb } from "../../components/breadcrumb";

export const Route = createRoute({
  getParentRoute: () => adminSettingsLayoutRoute,
  path: "/profile",
  component: AdminSettingsProfilePage,
});

function AdminSettingsProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [profileName, setProfileName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setProfileName(data.user.name);
        }
      })
      .catch(() => navigate({ to: "/login" }))
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const body: any = {};
      if (profileName !== user?.name) body.name = profileName;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (Object.keys(body).length === 0) {
        setError("No hay cambios que guardar.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al actualizar el perfil");
        return;
      }
      setUser(data.user);
      setProfileName(data.user.name);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Perfil actualizado correctamente.");
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
      <Breadcrumb items={[{ label: "Configuración", to: "/admin/settings" }, { label: "Perfil" }]} />
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="max-w-md">
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Perfil.
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            Actualiza tu nombre y cambia tu contraseña.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Email</Label>
              <Input type="email" value={user?.email || ""} wrapperClassName="max-w-full" disabled />
            </div>

            <div>
              <Label>Nombre completo</Label>
              <Input type="text" placeholder="Tu nombre" value={profileName} onChange={(e) => setProfileName(e.target.value)} wrapperClassName="max-w-full" />
            </div>

            <hr className="border-border" />
            <p className="text-[13px] font-medium leading-[18px] text-text-muted">Cambiar contraseña</p>

            <div>
              <Label>Contraseña actual</Label>
              <Input type="password" placeholder="Ingresa tu contraseña actual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} wrapperClassName="max-w-full" />
            </div>

            <div>
              <Label>Nueva contraseña</Label>
              <Input
                type="password"
                placeholder="Ingresa la nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                wrapperClassName="max-w-full"
              />
              <PasswordRequirements password={newPassword} show={passwordFocused} />
            </div>

            <div>
              <Label>Confirmar nueva contraseña</Label>
              <Input
                type="password"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmTouched(true)}
                wrapperClassName="max-w-full"
                error={
                  confirmTouched && confirmPassword.length > 0 && newPassword !== confirmPassword
                    ? "Las contraseñas no coinciden"
                    : undefined
                }
              />
            </div>

            {error && (
              <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">{error}</div>
            )}

            {success && (
              <div className="rounded-[6px] bg-info-bg border border-accent/20 px-3 py-2 text-[13px] leading-[18px] bg-info-text">{success}</div>
            )}

            <Button type="submit" size="md" disabled={loading}>
              {loading ? "Guardando..." : "Guardar perfil"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

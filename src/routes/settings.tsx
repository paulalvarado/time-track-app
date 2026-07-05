import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect } from "react";
import { Button, Input, Label, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Dropdown, DropdownItem, DropdownDivider } from "../components/ui";
import { useDarkMode } from "../lib/use-dark-mode";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

function LogoSvg({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const { isDark, toggle: toggleDark } = useDarkMode();

  // ─── Profile state ───
  const [profileName, setProfileName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // ─── Odoo state ───
  const [url, setUrl] = useState("");
  const [dbName, setDbName] = useState("");
  const [odooUsername, setOdooUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [odooError, setOdooError] = useState("");
  const [odooSuccess, setOdooSuccess] = useState("");
  const [odooLoading, setOdooLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);

  // ─── Gemini state ───
  const [geminiKey, setGeminiKey] = useState("");
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [geminiError, setGeminiError] = useState("");
  const [geminiSuccess, setGeminiSuccess] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);

  const confirmLogout = useDialog();

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
      .catch(() => navigate({ to: "/login" }));

    fetch("/api/odoo/config")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setUrl(data.config.url || "");
            setDbName(data.config.dbName || "");
            setOdooUsername(data.config.username || "");
            setHasConfig(true);
            setHasGeminiKey(!!data.config.hasGeminiKey);
          }
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [navigate]);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    navigate({ to: "/login" });
  };

  // ─── Profile submit ───
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError("Passwords do not match.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setProfileError("New password must be at least 6 characters.");
      return;
    }

    setProfileLoading(true);
    try {
      const body: any = {};
      if (profileName !== user?.name) body.name = profileName;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (Object.keys(body).length === 0) {
        setProfileError("No changes to save.");
        setProfileLoading(false);
        return;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile");
        return;
      }
      setUser(data.user);
      setProfileName(data.user.name);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfileSuccess("Profile updated successfully.");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch {
      setProfileError("Connection error. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Odoo submit ───
  const handleOdooSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOdooError("");
    setOdooSuccess("");
    setOdooLoading(true);
    try {
      const res = await fetch("/api/odoo/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, dbName, username: odooUsername, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOdooError(data.error || "Failed to save configuration");
        return;
      }
      setHasConfig(true);
      setOdooSuccess("Odoo configuration saved successfully.");
      setTimeout(() => setOdooSuccess(""), 3000);
    } catch {
      setOdooError("Connection error. Please try again.");
    } finally {
      setOdooLoading(false);
    }
  };

  // ─── Gemini submit ───
  const handleGeminiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiError("");
    setGeminiSuccess("");
    setGeminiLoading(true);
    try {
      const res = await fetch("/api/odoo/gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: geminiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGeminiError(data.error || "Failed to save key");
        return;
      }
      setHasGeminiKey(data.hasGeminiKey);
      setGeminiSuccess("Gemini API key saved successfully.");
      setTimeout(() => setGeminiSuccess(""), 3000);
    } catch {
      setGeminiError("Connection error. Please try again.");
    } finally {
      setGeminiLoading(false);
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
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <LogoSvg />
            <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">
              Dashboard
            </Link>
            {user && (
              <Dropdown
                align="end"
                trigger={
                  <div className="flex items-center gap-2 cursor-pointer select-none">
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  onClick={() => navigate({ to: "/settings" })}
                >
                  Settings
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
                  {isDark ? "Light mode" : "Dark mode"}
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  variant="danger"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                    </svg>
                  }
                  onClick={confirmLogout.show}
                >
                  Sign out
                </DropdownItem>
              </Dropdown>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="mx-auto max-w-[900px] px-6 py-8 space-y-12">
        {/* ─── Section: Profile ─── */}
        <section>
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Account Settings.
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            Manage your profile and connection settings.
          </p>

          <div className="mt-8 max-w-md">
            <h2 className="text-[16px] font-semibold leading-[24px] text-text-primary mb-4">Profile</h2>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  wrapperClassName="max-w-full"
                  disabled
                />
              </div>

              <div>
                <Label>Full name</Label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  wrapperClassName="max-w-full"
                />
              </div>

              <hr className="border-border" />

              <p className="text-[13px] font-medium leading-[18px] text-text-muted">Change password</p>

              <div>
                <Label>Current password</Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  wrapperClassName="max-w-full"
                />
              </div>

              <div>
                <Label>New password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  wrapperClassName="max-w-full"
                />
              </div>

              <div>
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  wrapperClassName="max-w-full"
                />
              </div>

              {profileError && (
                <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="rounded-[6px] bg-info-bg border border-accent/20 px-3 py-2 text-[13px] leading-[18px] bg-info-text">
                  {profileSuccess}
                </div>
              )}

              <Button type="submit" size="md" disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </div>
        </section>

        {/* ─── Section: Odoo Connection ─── */}
        <section>
          <hr className="border-border" />
          <div className="mt-8 max-w-md">
            <h2 className="text-[16px] font-semibold leading-[24px] text-text-primary mb-1">Odoo Connection</h2>
            <p className="text-[14px] leading-[20px] text-text-secondary mb-4">
              {hasConfig
                ? "Update your Odoo connection settings."
                : "Configure your Odoo instance to start tracking time."}
            </p>

            <form className="space-y-4" onSubmit={handleOdooSubmit}>
              <div>
                <Label>Odoo URL</Label>
                <Input
                  type="url"
                  placeholder="https://your-instance.odoo.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  wrapperClassName="max-w-full"
                  required
                />
              </div>

              <div>
                <Label>Database name</Label>
                <Input
                  type="text"
                  placeholder="your-database-name"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  wrapperClassName="max-w-full"
                  required
                />
              </div>

              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  placeholder="your-odoo-username"
                  value={odooUsername}
                  onChange={(e) => setOdooUsername(e.target.value)}
                  wrapperClassName="max-w-full"
                  required
                />
              </div>

              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder={hasConfig ? "Enter new API key to change it" : "your-api-key"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  wrapperClassName="max-w-full"
                  required
                />
              </div>

              {odooError && (
                <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">
                  {odooError}
                </div>
              )}

              {odooSuccess && (
                <div className="rounded-[6px] bg-info-bg border border-accent/20 px-3 py-2 text-[13px] leading-[18px] bg-info-text">
                  {odooSuccess}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" size="md" disabled={odooLoading}>
                  {odooLoading ? "Saving..." : hasConfig ? "Update Odoo" : "Connect Odoo"}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* ─── Section: Gemini AI ─── */}
        <section>
          <hr className="border-border" />
          <div className="mt-8 max-w-md">
            <h2 className="text-[16px] font-semibold leading-[24px] text-text-primary mb-1">Gemini AI</h2>
            <p className="text-[14px] leading-[20px] text-text-secondary mb-4">
              Configure your Gemini API key for voice-to-timesheet transcription.
              Get a free key at{" "}
              <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer"
                className="text-accent hover:underline">ai.google.dev</a>.
            </p>

            <form className="space-y-4" onSubmit={handleGeminiSubmit}>
              <div>
                <Label>Gemini API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  wrapperClassName="max-w-full"
                />
              </div>

              {geminiError && (
                <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">
                  {geminiError}
                </div>
              )}

              {geminiSuccess && (
                <div className="rounded-[6px] bg-success-bg border border-success/20 px-3 py-2 text-[13px] leading-[18px] text-success-text flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {geminiSuccess}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" size="md" disabled={geminiLoading}>
                  {geminiLoading ? "Saving..." : hasGeminiKey ? "Update Key" : "Save Key"}
                </Button>
                {hasGeminiKey && (
                  <span className="rounded-[4px] bg-success-bg px-2 py-0.5 text-[11px] font-medium leading-[16px] text-success-text">
                    Configured
                  </span>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Sign out confirmation dialog */}
      <Dialog open={confirmLogout.open} onClose={confirmLogout.close}>
        <DialogHeader
          title="Sign out"
          description="Are you sure you want to sign out?"
          onClose={confirmLogout.close}
        />
        <DialogBody>Your session will be ended.</DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={confirmLogout.close}>Cancel</Button>
          <Button variant="danger" size="md" onClick={handleLogout}>Sign out</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

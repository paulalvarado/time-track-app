import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect } from "react";
import { Button, Input, Label, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Dropdown, DropdownItem } from "../components/ui";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: OdooConfigPage,
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

function OdooConfigPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [url, setUrl] = useState("");
  const [dbName, setDbName] = useState("");
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);
  const confirmLogout = useDialog();

  useEffect(() => {
    // Load user info for header
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        navigate({ to: "/login" });
      });

    // Load existing config if available
    fetch("/api/odoo/config")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setUrl(data.config.url || "");
            setDbName(data.config.dbName || "");
            setUsername(data.config.username || "");
            setHasConfig(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/odoo/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, dbName, username, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save configuration");
        return;
      }
      navigate({ to: "/admin/dashboard" });
    } catch {
      setError("Connection error. Please try again.");
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
          <Link to="/admin/dashboard" className="flex items-center gap-2 no-underline">
            <LogoSvg />
            <span className="text-[16px] font-semibold text-text-primary">Time Track</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="text-[14px] leading-[20px] text-text-secondary hover:text-text-primary no-underline">
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  }
                  onClick={() => navigate({ to: "/settings" })}
                >
                  Profile
                </DropdownItem>
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
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="max-w-lg">
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            {hasConfig ? "Configure Odoo." : "Connect Odoo."}
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            {hasConfig
              ? "Update your Odoo connection settings."
              : "Configure your Odoo instance to start tracking time."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            {error && (
              <div className="rounded-[6px] bg-danger-bg border border-danger/20 px-3 py-2 text-[13px] leading-[18px] text-danger-text">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" size="md" disabled={loading}>
                {loading ? "Saving..." : hasConfig ? "Update" : "Connect"}
              </Button>
              <Link to="/">
                <Button variant="secondary" size="md" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
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

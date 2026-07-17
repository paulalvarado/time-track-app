import { createRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "../routes/__root";
import { useState, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { LogoutDialog } from "../components/navbar";
import { Footer } from "../components/footer";
import { NotFoundPage } from "../features/not-found/pages/not-found-page";
import { type User } from "../lib/api";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth-layout",
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.user?.isAdmin) {
          setUser(null);
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        navigate({ to: "/login" });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    setShowLogout(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary text-[14px]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            <NotFoundPage />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} onLogout={() => setShowLogout(true)} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <div className={`flex-1 flex flex-col transition-[padding] duration-200 ${sidebarCollapsed ? "pl-[64px]" : "pl-[240px]"}`}>
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
      <LogoutDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

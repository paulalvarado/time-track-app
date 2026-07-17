import { createRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "../routes/__root";
import { useState, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { LogoutDialog } from "../components/navbar";
import { Footer } from "../components/footer";
import { Breadcrumb } from "../components/breadcrumb";
import { BreadcrumbProvider, useBreadcrumb } from "../components/breadcrumb-context";
import { type User } from "../lib/api";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayout,
});

function AdminLayoutInner() {
  const { crumbs } = useBreadcrumb();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {crumbs.length > 0 && (
        <div className="mx-auto w-full max-w-[1200px] px-6 pt-6">
          <div className="pb-3">
            <Breadcrumb items={crumbs} />
          </div>
        </div>
      )}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.user?.isAdmin) {
          navigate({ to: "/dashboard" });
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        navigate({ to: "/admin/login" });
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

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} onLogout={() => setShowLogout(true)} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <div className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ${sidebarCollapsed ? "pl-[64px]" : "pl-[240px]"}`}>
        <BreadcrumbProvider>
          <AdminLayoutInner />
        </BreadcrumbProvider>
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

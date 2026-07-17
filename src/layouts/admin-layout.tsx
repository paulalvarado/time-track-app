import { createRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "../routes/__root";
import { useState, useEffect } from "react";
import { UserNavbar, LogoutDialog } from "../components/navbar";
import { Footer } from "../components/footer";
import { type User } from "../lib/api";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

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
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary text-[14px]">Cargando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <UserNavbar user={user} onLogout={() => setShowLogout(true)} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <LogoutDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

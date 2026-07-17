import { createRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Route as adminLayout } from "../layouts/admin-layout";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin",
  component: AdminRedirect,
});

function AdminRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/admin/dashboard", replace: true });
  }, [navigate]);

  return null;
}

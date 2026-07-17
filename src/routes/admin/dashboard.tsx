import { createRoute } from "@tanstack/react-router";
import { Route as adminLayout } from "../../layouts/admin-layout";
import { DashboardPage } from "../../features/dashboard/pages/dashboard-page";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/dashboard",
  component: DashboardPage,
});

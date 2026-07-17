import { createRoute } from "@tanstack/react-router";
import { Route as authLayout } from "../layouts/auth-layout";
import { DashboardPage } from "../features/dashboard/pages/dashboard-page";

export const Route = createRoute({
  getParentRoute: () => authLayout,
  path: "/dashboard",
  component: DashboardPage,
});

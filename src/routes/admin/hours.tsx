import { createRoute } from "@tanstack/react-router";
import { Route as adminLayout } from "../../layouts/admin-layout";
import { HoursPage } from "../../features/admin/pages/hours-page";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/hours",
  component: HoursPage,
});

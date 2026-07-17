import { createRoute } from "@tanstack/react-router";
import { Route as adminLayout } from "../../layouts/admin-layout";
import { HoursReportPage } from "../../features/admin/pages/hours-report-page";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/hours/report",
  component: HoursReportPage,
});

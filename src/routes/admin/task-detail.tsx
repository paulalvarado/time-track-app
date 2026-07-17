import { createRoute } from "@tanstack/react-router";
import { Route as adminLayout } from "../../layouts/admin-layout";
import { TaskDetailPage } from "../task-detail";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/projects/$projectId/tasks/$taskId",
  component: TaskDetailPage,
});

export const TimesheetRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/projects/$projectId/tasks/$taskId/timesheet",
  component: TaskDetailPage,
});

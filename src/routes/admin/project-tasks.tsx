import { createRoute } from "@tanstack/react-router";
import { Route as adminLayout } from "../../layouts/admin-layout";
import { ProjectTasksPage } from "../project-tasks";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/projects/$projectId",
  component: ProjectTasksPage,
});

import { createRoute } from "@tanstack/react-router";
import { Route as adminLayout } from "../../layouts/admin-layout";
import { ProjectsPage } from "../../features/projects/pages/projects-page";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/projects",
  component: ProjectsPage,
});

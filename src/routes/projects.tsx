import { createRoute } from "@tanstack/react-router";
import { Route as authLayout } from "../layouts/auth-layout";
import { ProjectsPage } from "../features/projects/pages/projects-page";

export const Route = createRoute({
  getParentRoute: () => authLayout,
  path: "/projects",
  component: ProjectsPage,
});

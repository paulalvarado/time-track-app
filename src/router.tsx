import { createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as dashboardRoute } from "./routes/dashboard";
import { Route as loginRoute } from "./routes/login";
import { Route as registerRoute } from "./routes/register";
import { Route as settingsLayoutRoute } from "./routes/settings-layout";
import { Route as settingsProfileRoute } from "./routes/settings-profile";
import { Route as settingsOdooRoute } from "./routes/settings-odoo";
import { Route as settingsAiRoute } from "./routes/settings-ai";
import { Route as projectsRoute } from "./routes/projects";
import { Route as projectTasksRoute } from "./routes/project-tasks";
import { Route as taskDetailRoute, TimesheetRoute as taskDetailTimesheetRoute } from "./routes/task-detail";
import { Route as designSystemRoute } from "./routes/design-system";
import { Route as formsRoute } from "./routes/forms";
import { Route as dialogsRoute } from "./routes/dialogs";
import { Route as termsRoute } from "./routes/terms";
import { Route as privacyRoute } from "./routes/privacy";
import { Route as adminRoute } from "./routes/admin";

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  loginRoute,
  registerRoute,
  settingsLayoutRoute.addChildren([
    settingsProfileRoute,
    settingsOdooRoute,
    settingsAiRoute,
  ]),
  projectsRoute,
  projectTasksRoute,
  taskDetailRoute,
  taskDetailTimesheetRoute,
  adminRoute,
  designSystemRoute,
  formsRoute,
  dialogsRoute,
  termsRoute,
  privacyRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

import { createRouter } from "@tanstack/react-router";

/* ─── Root ─── */
import { Route as rootRoute } from "./routes/__root";

/* ─── Layouts ─── */
import { Route as publicLayout } from "./layouts/public-layout";
import { Route as authLayout } from "./layouts/auth-layout";
import { Route as adminLayout } from "./layouts/admin-layout";

/* ─── Public routes ─── */
import { Route as indexRoute } from "./routes/index";
import { Route as loginRoute } from "./routes/login";
import { Route as registerRoute } from "./routes/register";
import { Route as termsRoute } from "./routes/terms";
import { Route as privacyRoute } from "./routes/privacy";
import { Route as designSystemRoute } from "./routes/design-system";
import { Route as formsRoute } from "./routes/forms";
import { Route as dialogsRoute } from "./routes/dialogs";
import { Route as adminLoginRoute } from "./routes/admin-login";

/* ─── Auth routes ─── */
import { Route as dashboardRoute } from "./routes/dashboard";
import { Route as projectsRoute } from "./routes/projects";
import { Route as projectTasksRoute } from "./routes/project-tasks";
import { Route as taskDetailRoute, TimesheetRoute as taskDetailTimesheetRoute } from "./routes/task-detail";
import { Route as settingsLayoutRoute } from "./routes/settings-layout";
import { Route as settingsProfileRoute } from "./routes/settings-profile";
import { Route as settingsOdooRoute } from "./routes/settings-odoo";
import { Route as settingsAiRoute } from "./routes/settings-ai";

/* ─── Admin routes ─── */
import { Route as adminRoute } from "./routes/admin";
import { Route as adminDashboardRoute } from "./routes/admin/dashboard";
import { Route as adminProjectsRoute } from "./routes/admin/projects";
import { Route as adminHoursRoute } from "./routes/admin/hours";
import { Route as adminUsersRoute } from "./routes/admin-users";
import { Route as adminRolesRoute } from "./routes/admin-roles";
import { Route as adminSettingsLayoutRoute } from "./routes/admin/settings-layout";
import { Route as adminSettingsRoute } from "./routes/admin/settings";
import { Route as adminSettingsProfileRoute } from "./routes/admin/settings-profile";
import { Route as adminSettingsOdooRoute } from "./routes/admin/settings-odoo";
import { Route as adminSettingsAiRoute } from "./routes/admin/settings-ai";

const routeTree = rootRoute.addChildren([
  /* Public layout */
  publicLayout.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    termsRoute,
    privacyRoute,
    designSystemRoute,
    formsRoute,
    dialogsRoute,
    adminLoginRoute,
  ]),

  /* Auth layout */
  authLayout.addChildren([
    dashboardRoute,
    projectsRoute,
    projectTasksRoute,
    taskDetailRoute,
    taskDetailTimesheetRoute,
    settingsLayoutRoute.addChildren([
      settingsProfileRoute,
      settingsOdooRoute,
      settingsAiRoute,
    ]),
  ]),

  /* Admin layout */
  adminLayout.addChildren([
    adminRoute,
    adminDashboardRoute,
    adminProjectsRoute,    adminHoursRoute,    adminUsersRoute,
    adminRolesRoute,
    adminSettingsLayoutRoute.addChildren([
      adminSettingsRoute,
      adminSettingsProfileRoute,
      adminSettingsOdooRoute,
      adminSettingsAiRoute,
    ]),
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

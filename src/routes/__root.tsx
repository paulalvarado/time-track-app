import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { useDarkMode } from "../lib/use-dark-mode";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { AppHeader } from "../components/app-header";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  useDarkMode();
  const location = useLocation();
  const hideHeader = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-page text-text-primary">
      {!hideHeader && <AppHeader />}
      <Outlet />
      <ThemeToggle />
    </div>
  );
}

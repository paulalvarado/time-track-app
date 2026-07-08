import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useDarkMode } from "../lib/use-dark-mode";
import { ThemeToggle } from "../components/ui/theme-toggle";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  useDarkMode();

  return (
    <div className="min-h-screen bg-page text-text-primary">
      <Outlet />
      <ThemeToggle />
    </div>
  );
}

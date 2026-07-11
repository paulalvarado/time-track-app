import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { AppHeader } from "../components/app-header";
import { ScrollArea } from "../components/ui";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const location = useLocation();
  const hideHeader = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-page text-text-primary overflow-hidden">
      <ScrollArea style={{ width: "100%", height: "100vh" }}>
        {!hideHeader && <AppHeader />}
        <Outlet />
        <ThemeToggle />
      </ScrollArea>
    </div>
  );
}

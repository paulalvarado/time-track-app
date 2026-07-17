import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { ScrollArea } from "../components/ui";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-page text-text-primary overflow-hidden">
      <ScrollArea style={{ width: "100%", height: "100vh" }}>
        <Outlet />
        <ThemeToggle />
      </ScrollArea>
    </div>
  );
}

import { createRoute, Outlet } from "@tanstack/react-router";
import { Route as rootRoute } from "../routes/__root";
import { PublicNavbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { ThemeToggle } from "../components/ui/theme-toggle";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <ThemeToggle />
    </div>
  );
}

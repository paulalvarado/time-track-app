import { createRoute, Outlet } from "@tanstack/react-router";
import { Route as rootRoute } from "../routes/__root";
import { PublicNavbar } from "../components/navbar";
import { Footer } from "../components/footer";

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
    </div>
  );
}

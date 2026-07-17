import { Link, useLocation } from "@tanstack/react-router";

type Crumb = {
  label: string;
  to?: string;
  params?: Record<string, string>;
};

function normalizeAdminPath(to: string | undefined, isAdminPath: boolean): string | undefined {
  if (!to) return to;
  if (isAdminPath && !to.startsWith("/admin")) {
    return `/admin${to}`;
  }
  if (!isAdminPath && to.startsWith("/admin")) {
    return to.replace(/^\/admin/, "") || "/";
  }
  return to;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin/");
  const dashboardTo = normalizeAdminPath("/dashboard", isAdminPath);
  const all = [
    { label: "Dashboard", to: dashboardTo },
    ...items.map((item) => ({
      ...item,
      to: normalizeAdminPath(item.to, isAdminPath),
    })),
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] leading-[18px] text-text-muted overflow-hidden">
        {all.map((crumb, i) => {
          const isLast = i === all.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {i > 0 && <span className="shrink-0">/</span>}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  params={crumb.params as any}
                  className="hover:text-text-primary no-underline text-inherit truncate shrink-0"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-secondary truncate min-w-0">
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </div>

  );
}

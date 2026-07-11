import { createRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Breadcrumb } from "../components/breadcrumb";


const sections = [
  { key: "profile", title: "Perfil", desc: "Actualiza tu nombre y cambia tu contraseña.", icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
  { key: "odoo", title: "Conexión Odoo", desc: "Configura tu instancia de Odoo para sincronizar proyectos.", icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" },
  { key: "ai", title: "IA", desc: "Configura proveedores de IA (OpenAI, Anthropic, Gemini) para transcripción.", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" },
];

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsLayout,
});

function SettingsLayout() {
  const location = useLocation();
  const isIndex = location.pathname === "/settings";

  return (
    <main className="min-h-screen bg-page">


      {isIndex ? (
        <>
          <Breadcrumb items={[{ label: "Configuración" }]} />
          <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
          <div>
            <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
              Configuración.
            </h1>
            <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
              Administra tu perfil, conexiones y proveedores de IA.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sections.map((s) => (
              <Link key={s.key} to={`/settings/${s.key}`} className="block no-underline group h-full">
                <div className="rounded-[8px] border border-border bg-card p-6 hover:border-border-hover transition-colors shadow-[0px_1px_1px_#00000003,0px_2px_4px_-2px_#00000005] h-full">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-surface mb-3 group-hover:bg-accent/10 transition-colors">
                    <svg className="h-4 w-4 text-text-primary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium leading-[20px] text-text-primary group-hover:text-accent transition-colors">{s.title}</p>
                  <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </>
      ) : (
        <Outlet />
      )}

    </main>
  );
}

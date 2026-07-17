import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-page flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-[64px] font-bold leading-[72px] text-text-primary tracking-[-2px]">
          404
        </h1>
        <p className="mt-3 text-[16px] leading-[24px] text-text-secondary max-w-sm mx-auto">
          La página que buscas no existe o no tienes acceso.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-[6px] bg-accent px-4 py-2 text-[13px] font-medium leading-[18px] text-white no-underline hover:opacity-90 transition-opacity"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

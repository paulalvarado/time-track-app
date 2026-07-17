import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
            <circle cx="14" cy="14" r="2" fill="currentColor" />
            <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] leading-[18px] text-text-muted">
            &copy; {new Date().getFullYear()} Time Track. Todos los derechos reservados.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/terms"
            className="text-[13px] leading-[18px] text-text-muted hover:text-text-secondary no-underline transition-colors"
          >
            Términos
          </Link>
          <Link
            to="/privacy"
            className="text-[13px] leading-[18px] text-text-muted hover:text-text-secondary no-underline transition-colors"
          >
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}

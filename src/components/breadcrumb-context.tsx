import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";

type Crumb = {
  label: string;
  to?: string;
  params?: Record<string, string>;
};

type BreadcrumbContextType = {
  crumbs: Crumb[];
  setCrumbs: (crumbs: Crumb[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  return (
    <BreadcrumbContext.Provider value={{ crumbs, setCrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useSetBreadcrumb(crumbs: Crumb[] | null) {
  const ctx = useContext(BreadcrumbContext);
  const prevRef = useRef<string>("");

  useEffect(() => {
    if (!ctx || !crumbs) return;
    const serialized = JSON.stringify(crumbs);
    if (serialized !== prevRef.current) {
      prevRef.current = serialized;
      ctx.setCrumbs(crumbs);
    }
  });
}

export function useBreadcrumb(): BreadcrumbContextType {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  return ctx;
}

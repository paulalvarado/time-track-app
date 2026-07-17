import { useState, useEffect, useRef, type ReactNode } from "react";
import { Card } from "../../../components/ui";

/* ─── Types ─── */

export type Column<T> = {
  key: string;
  label: string;
  className?: string;
  cellClassName?: string;
  render?: (item: T) => ReactNode;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  storageKey?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  renderRow: (item: T) => ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
};

/* ─── Constants ─── */

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20];

/* ─── PageSizeDropdown ─── */

function PageSizeDropdown({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-8 items-center gap-1 rounded-[6px] border bg-card px-2 text-[13px] leading-[18px] text-text-primary outline-none transition-all duration-150 cursor-pointer ${
          open
            ? "border-[#171717] ring-[3px] ring-text-primary/10"
            : "border-border hover:border-[#a1a1a1]"
        }`}
      >
        <span>{value}</span>
        <svg
          className={`h-3.5 w-3.5 text-text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[60px] rounded-[8px] border border-border bg-card shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
          <div className="p-0.5 space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-[4px] px-2 py-1.5 text-[13px] leading-[18px] transition-colors ${
                    isSelected
                      ? "text-text-primary bg-surface"
                      : "text-text-primary hover:bg-page"
                  }`}
                >
                  <div
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                      isSelected
                        ? "border-[#171717] bg-[#171717]"
                        : "border-[#a1a1a1] bg-card"
                    }`}
                  >
                    <svg
                      className={`h-2.5 w-2.5 text-[#ffffff] transition-opacity ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Pagination ─── */

function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const goToPage = (p: number) => {
    onPageChange(Math.max(0, Math.min(totalPages - 1, p)));
  };

  const visiblePages = () => {
    const maxVisible = 5;
    const pages: number[] = [];
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-text-muted">
          {totalCount} registros
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-text-muted">Mostrar</span>
          <PageSizeDropdown
            value={pageSize}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
          />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => goToPage(page - 1)}
            className="inline-flex items-center justify-center rounded-[6px] border border-border h-8 w-8 text-[13px] text-text-secondary hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>

          {visiblePages().map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              className={`inline-flex items-center justify-center rounded-[6px] h-8 min-w-[32px] px-2 text-[13px] font-medium transition-colors cursor-pointer ${
                p === page
                  ? "bg-text-primary text-page"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              {p + 1}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => goToPage(page + 1)}
            className="inline-flex items-center justify-center rounded-[6px] border border-border h-8 w-8 text-[13px] text-text-secondary hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── DataTable ─── */

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  totalCount,
  page,
  totalPages,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  storageKey,
  onPageChange,
  onPageSizeChange,
  renderRow,
  emptyMessage = "No hay registros.",
  emptyDescription = "Intenta cambiar los filtros a un rango más amplio.",
}: DataTableProps<T>) {
  // Persistir pageSize en localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, String(pageSize));
    } catch {}
  }, [pageSize, storageKey]);

  const showSkeleton = loading && data.length === 0;
  const showTable = data.length > 0;
  const showEmpty = !loading && data.length === 0;
  const showPagination = totalCount > 0;

  return (
    <>
      {/* Skeleton loading (solo en carga inicial) */}
      {showSkeleton && (
        <Card variant="default" className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-5 py-3 text-[12px] font-medium text-text-muted tracking-wider uppercase ${col.className ?? ""}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(pageSize > 5 ? 6 : pageSize)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3">
                        <div className="h-5 w-[80px] rounded-sm bg-surface animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tabla de datos (siempre visible si hay datos, incluso durante recarga) */}
      {showTable && (
        <Card variant="default" className="overflow-hidden !p-0">
          <div className={`overflow-x-auto ${loading ? "opacity-60 transition-opacity" : ""}`}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-5 py-3 text-[12px] font-medium text-text-muted tracking-wider uppercase ${col.className ?? ""}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{data.map((item) => renderRow(item))}</tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Estado vacío */}
      {showEmpty && (
        <Card variant="default" className="overflow-hidden !p-0">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="h-10 w-10 text-text-muted mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <p className="text-[14px] text-text-secondary">{emptyMessage}</p>
            <p className="text-[13px] text-text-muted mt-1">{emptyDescription}</p>
          </div>
        </Card>
      )}

      {/* Paginación (siempre visible cuando hay registros) */}
      {showPagination && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </>
  );
}

import React, { useState, useRef, useEffect } from "react";

/* ─── Dialog Root ─── */

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handler);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/40"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-[12px] border border-border bg-card p-6 shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Dialog Header ─── */

type DialogHeaderProps = {
  title: string;
  description?: string;
  onClose?: () => void;
};

export function DialogHeader({ title, description, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-[20px] font-semibold leading-[28px] tracking-[-0.6px] text-text-primary">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── Dialog Body ─── */

export function DialogBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[14px] leading-[20px] text-text-secondary ${className}`}>{children}</div>;
}

/* ─── Dialog Footer ─── */

type DialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`mt-6 flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}

/* ─── useDialog hook ─── */

export function useDialog(initial = false) {
  const [open, setOpen] = useState(initial);
  return {
    open,
    isOpen: open,
    show: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen((p) => !p),
  };
}

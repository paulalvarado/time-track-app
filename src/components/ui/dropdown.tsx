import React, { useState, useRef, useEffect } from "react";

/* ─── Dropdown Root ─── */

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
};

export function Dropdown({ trigger, children, align = "start", className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full">
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute z-10 mt-1.5 w-48 origin-top-${
            align === "end" ? "right" : "left"
          } rounded-[8px] border border-border bg-card p-1 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset] ${
            align === "end" ? "right-0" : "left-0"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Dropdown Item ─── */

type DropdownItemProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onClick?: () => void;
  className?: string;
};

export function DropdownItem({
  children,
  icon,
  variant = "default",
  onClick,
  className = "",
}: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-[4px] px-2.5 py-2 text-[14px] leading-[20px] transition-colors ${
        variant === "danger"
          ? "text-[#ee0000] hover:bg-danger-bg"
          : "text-text-primary hover:bg-surface"
      } ${className}`}
    >
      {icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center text-current">{icon}</span>}
      {children}
    </button>
  );
}

/* ─── Dropdown Divider ─── */

export function DropdownDivider({ className = "" }: { className?: string }) {
  return <div className={`border-t border-border my-1 ${className}`} />;
}

/* ─── Dropdown Header ─── */

type DropdownHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function DropdownHeader({ children, className = "" }: DropdownHeaderProps) {
  return (
    <div className={`border-b border-border px-2.5 py-2 mb-1 ${className}`}>
      {children}
    </div>
  );
}

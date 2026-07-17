import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "./scroll-area";

type Option = {
  value: string;
  label: string;
};

type SelectMenuProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wrapperClassName?: string;
  disabled?: boolean;
};

export function SelectMenu({
  options,
  value,
  onChange,
  placeholder = "Select...",
  wrapperClassName = "",
  disabled = false,
}: SelectMenuProps) {
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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${wrapperClassName}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={`flex h-10 w-full items-center justify-between rounded-[6px] border bg-card px-3 text-[14px] leading-[20px] outline-none transition-all duration-150 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${
          open
            ? "border-[#171717] ring-[3px] ring-text-primary/10"
            : "border-border hover:border-[#a1a1a1]"
        }`}
      >
        <span className={selected ? "text-text-primary" : "text-text-muted"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-[8px] border border-border bg-card shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
          <ScrollArea style={{ maxHeight: "240px", width: "100%" }}>
            <div className="p-1 space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) {
                        onChange(opt.value);
                        setOpen(false);
                      }
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-[4px] px-2.5 py-2 text-[14px] leading-[20px] transition-colors ${
                      isSelected
                        ? "text-text-primary bg-surface"
                        : "text-text-primary hover:bg-page"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                        isSelected
                          ? "border-[#171717] bg-[#171717]"
                          : "border-[#a1a1a1] bg-card"
                      }`}
                    >
                      <svg
                        className={`h-3 w-3 text-[#ffffff] transition-opacity ${
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
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

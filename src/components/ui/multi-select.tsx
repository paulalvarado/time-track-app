import React, { useState, useRef, useEffect, useMemo } from "react";

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  wrapperClassName?: string;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  wrapperClassName = "",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase())),
    [options, filter]
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const remove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  const selectedLabels = options.filter((o) => selected.includes(o.value));

  return (
    <div ref={ref} className={`relative ${wrapperClassName}`}>
      {/* Trigger */}
      <div
        className={`flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-[6px] border bg-card px-3 py-1.5 text-[14px] leading-[20px] cursor-text transition-all duration-150 hover:border-[#a1a1a1] outline-none ${
          open ? "border-[#171717] ring-[3px] ring-text-primary/10" : "border-border"
        }`}
        onClick={() => {
          setOpen(true);
          ref.current?.querySelector("input")?.focus();
        }}
      >
        {selectedLabels.map((opt) => (
          <span
            key={opt.value}
            className="inline-flex h-6 items-center gap-1 rounded-[4px] bg-surface px-2 text-[13px] leading-[20px] text-text-secondary whitespace-nowrap"
          >
            {opt.label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(opt.value);
              }}
              className="inline-flex text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setFilter("");
            }
            if (e.key === "Backspace" && filter === "" && selected.length > 0) {
              remove(selected[selected.length - 1]);
            }
            if (e.key === "Enter" && filtered.length === 1 && !selected.includes(filtered[0].value)) {
              toggle(filtered[0].value);
              setFilter("");
            }
          }}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="min-w-[60px] flex-1 border-0 bg-transparent p-0 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-full rounded-[8px] border border-border bg-card p-1 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset] max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-2.5 py-3 text-[14px] leading-[20px] text-text-muted text-center">
              No options found
            </div>
          ) : (
            filtered.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    toggle(opt.value);
                    setFilter("");
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
                  {isSelected && (
                    <span className="ml-auto text-[11px] text-text-muted">selected</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useCallback } from "react";

type NumberInputProps = {
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  wrapperClassName?: string;
  disabled?: boolean;
};

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  placeholder = "",
  wrapperClassName = "",
  disabled = false,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentNum = parseFloat(String(value)) || 0;

  const clamp = useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max]);

  const commit = useCallback(
    (raw: string) => {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(String(clamp(parsed)));
      }
    },
    [clamp, onChange]
  );

  const add = useCallback(
    (delta: number) => {
      const next = clamp(currentNum + delta);
      onChange(String(next));
    },
    [currentNum, clamp, onChange]
  );

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const startHold = (delta: number) => {
    add(delta);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => add(delta), 100);
    }, 300);
  };

  const stopHold = () => clearTimers();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty, negative sign, or valid number patterns while typing
    if (raw === "" || raw === "-" || /^-?\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    // Clamp on blur
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(String(clamp(parsed)));
    } else {
      onChange(String(clamp(0)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") { e.preventDefault(); add(step); }
    if (e.key === "ArrowDown") { e.preventDefault(); add(-step); }
  };

  const containerBorder = focused
    ? "border-text-primary ring-[3px] ring-text-primary/10"
    : "border-border hover:border-text-primary/40";

  const iconBase =
    "flex items-center justify-center w-9 h-full cursor-pointer select-none outline-none transition-all duration-150";

  const isAtMin = currentNum <= min;
  const isAtMax = currentNum >= max;

  return (
    <div className={`relative ${wrapperClassName}`}>
      <div className={`relative flex items-center h-10 rounded-[6px] border bg-card overflow-hidden ${containerBorder}`}>
        {/* Decrement */}
        <button
          type="button"
          disabled={disabled || isAtMin}
          onMouseDown={(e) => { e.preventDefault(); startHold(-step); }}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={(e) => { e.preventDefault(); startHold(-step); }}
          onTouchEnd={stopHold}
          className={`${iconBase} ${
            disabled || isAtMin
              ? "text-text-muted/30 cursor-not-allowed"
              : "text-text-muted hover:bg-surface hover:text-text-primary active:bg-page"
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>

        {/* Divider */}
        <div className={`h-5 w-px shrink-0 ${focused ? "bg-text-primary/15" : "bg-border"}`} />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`h-full flex-1 min-w-0 bg-transparent text-[14px] leading-[20px] outline-none text-center font-medium tabular-nums px-1 ${
            disabled
              ? "text-text-muted cursor-not-allowed select-none"
              : "text-text-primary cursor-text"
          }`}
          autoComplete="off"
        />

        {/* Divider */}
        <div className={`h-5 w-px shrink-0 ${focused ? "bg-text-primary/15" : "bg-border"}`} />

        {/* Increment */}
        <button
          type="button"
          disabled={disabled || isAtMax}
          onMouseDown={(e) => { e.preventDefault(); startHold(step); }}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={(e) => { e.preventDefault(); startHold(step); }}
          onTouchEnd={stopHold}
          className={`${iconBase} ${
            disabled || isAtMax
              ? "text-text-muted/30 cursor-not-allowed"
              : "text-text-muted hover:bg-surface hover:text-text-primary active:bg-page"
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

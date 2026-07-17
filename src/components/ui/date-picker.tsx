import React, { useState, useRef, useEffect, useMemo } from "react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wrapperClassName?: string;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toDate(iso: string): Date {
  if (!iso) return new Date();
  const parts = iso.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0]), m = parseInt(parts[1]) - 1, d = parseInt(parts[2]);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m, d);
  }
  const fallback = new Date(iso + "T12:00:00");
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return "";
  const d = toDate(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export function DatePicker({ value, onChange, placeholder = "Select date...", wrapperClassName = "" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => toDate(value).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => toDate(value).getMonth());
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

  const days = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedDate = value ? toDate(value) : null;

  const isToday = (day: number) => {
    const now = new Date();
    return now.getFullYear() === viewYear && now.getMonth() === viewMonth && now.getDate() === day;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else { setViewMonth((m) => m - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else { setViewMonth((m) => m + 1); }
  };

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    onChange(toISO(d));
    setOpen(false);
  };

  const todayISO = toISO(new Date());

  return (
    <div ref={ref} className={`relative ${wrapperClassName}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) { const d = toDate(value); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); } }}
        className={`flex h-10 w-full items-center justify-between rounded-[6px] border bg-card px-3 text-[14px] leading-[20px] outline-none transition-all duration-150 cursor-pointer ${
          open
            ? "border-text-primary ring-[3px] ring-text-primary/10"
            : "border-border hover:border-text-primary/40"
        }`}
      >
        <span className={value ? "text-text-primary" : "text-text-muted"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <svg
          className="h-4 w-4 text-text-muted shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-[280px] rounded-[8px] border border-border bg-card p-3 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
          {/* Month/year header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] text-text-muted hover:text-text-primary hover:bg-page transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-[14px] font-medium leading-[20px] text-text-primary select-none">
              {new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] text-text-muted hover:text-text-primary hover:bg-page transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="flex h-8 items-center justify-center text-[11px] font-medium leading-[14px] text-text-muted select-none">
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-8" />;
              const selected = isSelected(day);
              const today = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`flex h-8 w-full items-center justify-center rounded-[4px] text-[13px] leading-[18px] transition-all duration-100 cursor-pointer ${
                    today
                      ? "bg-[#171717] text-[#ffffff] font-medium"
                      : selected
                        ? "text-text-primary font-medium border border-border"
                        : "text-text-secondary hover:bg-page hover:text-text-primary"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => { onChange(todayISO); setOpen(false); }}
              className="flex w-full items-center justify-center gap-1.5 rounded-[4px] py-1.5 text-[12px] leading-[16px] text-text-muted hover:text-text-primary hover:bg-page transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

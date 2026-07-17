import React from "react";

type RadioOption = {
  value: string;
  label: React.ReactNode;
};

type RadioGroupProps = {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function RadioGroup({ name, options, value, onChange, className = "" }: RadioGroupProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className="flex items-center gap-2.5 text-[13px] leading-[18px] text-text-primary cursor-pointer select-none"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="peer sr-only"
            />
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors peer-checked:border-accent ${
                selected
                  ? "border-accent"
                  : "border-[#a1a1a1]"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full transition-all duration-150 ${
                  selected
                    ? "bg-accent scale-100"
                    : "bg-transparent scale-0"
                }`}
              />
            </div>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

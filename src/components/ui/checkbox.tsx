import React, { useState } from "react";

type CheckboxProps = {
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type">;

export function Checkbox({ label, checked: controlledChecked, onChange, className = "", ...props }: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const toggle = () => {
    const next = !checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <label className={`flex cursor-pointer items-center gap-2.5 rounded-[4px] px-2 py-1.5 text-[14px] leading-[20px] text-text-primary hover:bg-page transition-colors ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={toggle}
        className="peer sr-only"
        {...props}
      />
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors peer-checked:border-[#171717] peer-checked:bg-[#171717] ${
          checked
            ? "border-[#171717] bg-[#171717]"
            : "border-[#a1a1a1] bg-card"
        }`}
      >
        <svg
          className={`h-3 w-3 text-[#ffffff] transition-opacity ${
            checked ? "opacity-100" : "opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      {label}
    </label>
  );
}

import React from "react";

type LabelProps = {
  children: React.ReactNode;
  className?: string;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <label
      className={`mb-1.5 block font-mono text-[12px] leading-[16px] text-text-muted ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

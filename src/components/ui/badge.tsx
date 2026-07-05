import React from "react";

type BadgeVariant = "default" | "info" | "warning" | "error" | "success";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-page text-text-secondary",
  info: "bg-info-bg text-accent",
  warning: "bg-[#ffefcf] text-[#ab570a]",
  error: "bg-danger-bg text-danger-text",
  success: "bg-info-bg text-accent",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0 text-[12px] leading-[16px] ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

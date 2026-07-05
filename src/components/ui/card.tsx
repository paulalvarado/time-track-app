import React from "react";

type CardVariant = "default" | "large" | "soft" | "dark" | "pricing" | "pricing-featured";

type CardProps = {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const variantStyles: Record<CardVariant, string> = {
  default:
    "rounded-[8px] bg-card p-6 shadow-[0px_2px_2px_#0000000a,0px_8px_8px_-8px_#0000000a,0_0_0_1px_#00000014_inset]",
  large:
    "rounded-[12px] bg-card p-8 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]",
  soft:
    "rounded-[8px] bg-page p-6",
  dark:
    "rounded-[8px] bg-[#171717] p-6 text-[#ffffff]",
  pricing:
    "rounded-[12px] bg-card p-8 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]",
  "pricing-featured":
    "rounded-[12px] bg-[#171717] p-8 text-[#ffffff] shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset]",
};

export function Card({ variant = "default", children, className = "", ...props }: CardProps) {
  return (
    <div className={variantStyles[variant] + " " + className} {...props}>
      {children}
    </div>
  );
}

export function CardLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block font-mono text-[12px] leading-[16px] text-text-muted ${className}`}>
      {children}
    </span>
  );
}

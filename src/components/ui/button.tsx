import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#171717] text-[#ffffff] hover:bg-[#000000] border-transparent dark:bg-white dark:text-[#171717] dark:hover:bg-white/90",
  secondary:
    "bg-card text-text-primary hover:bg-page border-border",
  danger:
    "bg-[#ee0000] text-[#ffffff] hover:bg-[#c50000] border-transparent",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] font-medium leading-[20px]",
  md: "h-10 px-4 text-[14px] font-medium leading-[20px]",
  lg: "h-12 px-5 text-[16px] font-medium leading-[24px]",
};

export function Button({
  variant = "primary",
  size = "md",
  pill = false,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-[6px] border transition-all duration-150 focus:outline-none focus:ring-[3px] focus:ring-text-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${pill ? "rounded-[100px]!" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

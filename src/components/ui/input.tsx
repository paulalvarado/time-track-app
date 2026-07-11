import React, { forwardRef, useState } from "react";

type InputSize = "sm" | "md" | "lg";

type TrailingIconDef = {
  icon: React.ReactNode;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  label?: string;
};

type InputProps = {
  size?: InputSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingClick?: () => void;
  trailingIcons?: TrailingIconDef[];
  suffix?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  label?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 text-[14px] leading-[20px]",
  md: "h-10 text-[14px] leading-[20px]",
  lg: "h-12 text-[16px] leading-[24px]",
};

const labelSizes: Record<InputSize, string> = {
  sm: "text-[11px] leading-[14px]",
  md: "text-[12px] leading-[16px]",
  lg: "text-[13px] leading-[18px]",
};

const paddingStyles = {
  sm: { leading: "pl-8", trailing: "pr-8", left: "pl-3", right: "pr-3" },
  md: { leading: "pl-9", trailing: "pr-9", left: "pl-3", right: "pr-3" },
  lg: { leading: "pl-10", trailing: "pr-10", left: "pl-4", right: "pr-4" },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      leadingIcon,
      trailingIcon,
      onTrailingClick,
      trailingIcons,
      suffix,
      error,
      helperText,
      wrapperClassName = "",
      className = "",
      label,
      disabled,
      readOnly,
      value: controlledValue,
      defaultValue,
      placeholder,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(
      controlledValue !== undefined ? String(controlledValue) : defaultValue !== undefined ? String(defaultValue) : ""
    );

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? String(controlledValue) : internalValue;
    const hasValue = focused || currentValue.length > 0;

    const pad = paddingStyles[size];
    const leftPad = leadingIcon ? pad.leading : pad.left;
    const hasTrailing = !!trailingIcon || (!!trailingIcons && trailingIcons.length > 0);
    const rightPad = hasTrailing ? pad.trailing : suffix ? pad.trailing : pad.right;

    const hasFloatingLabel = !!label && (size === "md" || size === "lg");

    const borderColor = error
      ? "border-danger focus:border-danger focus:ring-[3px] focus:ring-danger/10"
      : "border-border hover:border-text-primary/40 focus:border-text-primary focus:ring-[3px] focus:ring-text-primary/10";

    const bgStyle = disabled
      ? "bg-surface text-text-muted cursor-not-allowed select-none"
      : readOnly
        ? "bg-page text-text-secondary cursor-default"
        : "bg-card text-text-primary cursor-text";

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const showFloating = focused || currentValue.length > 0;
    const effectivePlaceholder = hasFloatingLabel && showFloating ? (placeholder || "") : (placeholder || label || "");

    return (
      <div className={wrapperClassName}>
        <div className="relative">
          {leadingIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-text-muted">
              {leadingIcon}
            </div>
          )}
          {hasFloatingLabel && (
            <label
              className={`pointer-events-none absolute left-0 z-10 origin-left transition-all duration-200 ease-out ${
                error
                  ? "text-danger"
                  : focused
                    ? "text-text-primary"
                    : "text-text-muted"
              } ${leadingIcon ? "pl-9" : "pl-3"} ${trailingIcon ? "pr-9" : "pr-3"}`}
              style={{
                top: showFloating ? "-0.5px" : "50%",
                transform: showFloating
                  ? "translateY(-50%) scale(0.75)"
                  : "translateY(-50%) scale(1)",
                transformOrigin: "left center",
                transition: "top 0.2s ease-out, transform 0.2s ease-out",
              }}
            >
              {label}
            </label>
          )}
          <input
            ref={ref}
            disabled={disabled}
            readOnly={readOnly}
            value={isControlled ? controlledValue : internalValue}
            placeholder={effectivePlaceholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full rounded-[6px] border outline-none transition-all duration-150 placeholder:text-text-muted ${
              hasFloatingLabel ? "pt-4 pb-1" : ""
            } ${sizeStyles[size]} ${leftPad} ${rightPad} ${borderColor} ${bgStyle} ${className}`}
            {...props}
          />
          {trailingIcon && (
            <button
              type="button"
              disabled={disabled}
              tabIndex={-1}
              onClick={onTrailingClick}
              className={`absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors ${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {trailingIcon}
            </button>
          )}
          {trailingIcons && trailingIcons.length > 0 && (
            <div className="absolute inset-y-0 right-0 z-10 flex items-center gap-0.5 pr-2">
              {trailingIcons.map((ti, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  tabIndex={-1}
                  aria-label={ti.label}
                  onClick={ti.onClick}
                  onMouseDown={ti.onMouseDown}
                  onMouseUp={ti.onMouseUp}
                  onMouseLeave={ti.onMouseLeave}
                  className={`flex items-center justify-center rounded-[4px] p-1 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {ti.icon}
                </button>
              ))}
            </div>
          )}
          {suffix && (
            <span className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-text-muted text-[14px] leading-[20px] select-none pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 flex items-center gap-1 text-[12px] leading-[16px] text-[#ee0000]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-[12px] leading-[16px] text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

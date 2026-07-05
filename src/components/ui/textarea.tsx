import React, { forwardRef, useState } from "react";

type TextareaProps = {
  showCount?: boolean;
  maxLength?: number;
  mono?: boolean;
  error?: string;
  wrapperClassName?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      showCount = false,
      maxLength,
      mono = false,
      error,
      wrapperClassName = "",
      className = "",
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      typeof props.defaultValue === "string" ? props.defaultValue.length : 0
    );

    const borderColor = error
      ? "border-danger focus:border-danger focus:ring-[3px] focus:ring-danger/10"
      : "border-border focus:border-text-primary focus:ring-[3px] focus:ring-text-primary/10";

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className={wrapperClassName}>
        <textarea
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          className={`w-full resize-y rounded-[6px] border bg-card px-3 py-2.5 text-[14px] leading-[20px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:ring-[3px] ${
            mono ? "font-mono text-[13px] leading-[20px]" : ""
          } ${borderColor} ${className}`}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          {error ? (
            <p className="text-[12px] leading-[16px] text-[#ee0000]">{error}</p>
          ) : (
            <span />
          )}
          {showCount && (
            <p className="text-[12px] leading-[16px] text-text-muted">
              {charCount}{maxLength ? ` / ${maxLength}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

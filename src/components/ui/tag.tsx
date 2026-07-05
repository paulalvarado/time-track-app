import React from "react";

type TagProps = {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
};

export function Tag({ children, onRemove, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-[4px] bg-surface px-2 text-[13px] leading-[20px] text-text-secondary ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

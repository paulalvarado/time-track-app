import React from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { useDarkMode } from "../../lib/use-dark-mode";

type ScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  options?: Record<string, any>;
};

export function ScrollArea({ children, className = "", style, options }: ScrollAreaProps) {
  const { isDark } = useDarkMode();

  const baseScrollbars = {
    theme: isDark ? "os-theme-light" : "os-theme-dark",
    autoHide: "scroll",
    autoHideDelay: 600,
    clickScroll: true,
  };

  const mergedOptions = {
    ...options,
    scrollbars: {
      ...baseScrollbars,
      ...(options?.scrollbars || {}),
    },
  };

  return (
    <OverlayScrollbarsComponent
      className={className}
      style={style}
      options={mergedOptions}
      defer
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}

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

  return (
    <OverlayScrollbarsComponent
      className={className}
      style={style}
      options={{
        scrollbars: {
          theme: isDark ? "os-theme-dark" : "os-theme-light",
          autoHide: "scroll",
          autoHideDelay: 600,
          clickScroll: true,
        },
        ...options,
      }}
      defer
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}

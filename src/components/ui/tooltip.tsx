import React, { useState, useRef } from "react";

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom";
};

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: position === "top" ? rect.top : rect.bottom,
      });
    }
    setShow(true);
  };

  const handleMouseLeave = () => setShow(false);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {show && (
        <div
          className="fixed z-[100] px-3 py-1.5 rounded-[6px] border border-border bg-card text-[13px] leading-[18px] text-text-primary shadow-[0px_4px_12px_#0000001a,0_0_0_1px_#00000014_inset] whitespace-normal break-words max-w-[400px] pointer-events-none animate-[fadeIn_0.15s_ease-out]"
          style={{
            left: coords.x,
            top: position === "top" ? coords.y - 4 : coords.y + 4,
            transform: position === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

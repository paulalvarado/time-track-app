import { useState, useEffect } from "react";

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

const SYMBOLS = "!@#$%^&*()_+-=";

const rules = [
  {
    key: "length",
    label: "Al menos 8 caracteres",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "number",
    label: "Al menos un número",
    test: (p: string) => /\d/.test(p),
  },
  {
    key: "symbol",
    label: `Al menos un símbolo (${SYMBOLS})`,
    test: (p: string) => [...SYMBOLS].some((s) => p.includes(s)),
  },
];

export function PasswordRequirements({ password, show }: PasswordRequirementsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show || password.length > 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [show, password]);

  if (!visible) return null;

  const allPassed = rules.every((r) => r.test(password));

  return (
    <div
      className={`pointer-events-none mt-2 rounded-[6px] border p-3 text-[12px] leading-[16px] font-mono tracking-tight transition-all duration-200 ${
        allPassed
          ? "border-[#22c55e]/30 bg-[#22c55e]/5 text-[#22c55e]"
          : "border-border bg-card text-text-muted"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        {rules.map((rule) => {
          const passed = rule.test(password);
          return (
            <div key={rule.key} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[10px] font-bold leading-none transition-colors duration-200 ${
                  passed
                    ? "bg-[#22c55e] text-white"
                    : "bg-surface text-text-muted"
                }`}
              >
                {passed ? "✓" : "·"}
              </span>
              <span
                className={`transition-colors duration-200 ${
                  passed ? "text-[#22c55e]" : "text-text-muted"
                }`}
              >
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

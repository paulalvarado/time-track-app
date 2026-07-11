import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./index.css";

// ── Interceptor global de fetch ────────────────────────────────────────
// ── Interceptor global de fetch ────────────────────────────────────────
// En producción: __API_URL__ en index.html es reemplazado por docker-entrypoint.sh
// En desarrollo: el placeholder queda como "__API_URL__" — se ignora.
(function () {
  const raw =
    typeof window !== "undefined"
      ? (window as any).__VITE_API_URL__ ?? ""
      : "";
  const apiBase = raw && raw !== "__API_URL__" ? raw : "";
  if (!apiBase) return; // ← modo desarrollo, no tocar fetch

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api/")) {
      const url = `${apiBase}${input}`;
      console.debug("[API] Fetching:", url);
      return originalFetch(url, { ...init, credentials: "include" });
    }
    return originalFetch(input, init);
  };
})();
// ────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);

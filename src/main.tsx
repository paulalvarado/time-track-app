import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./index.css";

// ── Interceptor global de fetch ────────────────────────────────────────
// En producción, env.js (generado por docker-entrypoint.sh) define
// window.__VITE_API_URL__ con la URL de la API. Interceptamos fetch
// para anteponer esa URL a todas las peticiones /api/*
const apiBase =
  typeof window !== "undefined"
    ? (window as any).__VITE_API_URL__ ?? ""
    : "";

if (apiBase) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api/")) {
      return originalFetch(`${apiBase}${input}`, init);
    }
    return originalFetch(input, init);
  };
}
// ────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

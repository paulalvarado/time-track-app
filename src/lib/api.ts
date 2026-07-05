/**
 * URL base de la API.
 * En producción la inyecta docker-entrypoint.sh via env.js (window.__VITE_API_URL__).
 * En desarrollo usa el proxy de Vite (vite.config.ts).
 */
const API_BASE =
  (typeof window !== "undefined" && (window as any).__VITE_API_URL__) ||
  "";

/**
 * Wrapper de fetch que antepone la URL base de la API.
 */
export async function apiFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API_BASE}${url}`, init);
}

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

/* ─── Tipos compartidos ─── */

export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  hasOdooConfig?: boolean;
  createdAt?: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
};

export type Permission = {
  id: string;
  key: string;
  name: string;
  group: string;
};

export type PermissionGroup = Record<string, Permission[]>;

/* ─── API request helper tipado ─── */

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const res = await apiFetch(path, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/* ─── Convenience wrappers por dominio ─── */

const API_PREFIX = "/api";

function apiUrl(path: string) {
  return `${API_PREFIX}${path}`;
}

export const authApi = {
  me: () => request<{ user: User }>(apiUrl("/auth/me")),
  login: (data: { email: string; password: string }) =>
    request<{ user: User }>(apiUrl("/auth/login"), { method: "POST", body: data }),
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User }>(apiUrl("/auth/register"), { method: "POST", body: data }),
  logout: () => request<void>(apiUrl("/auth/logout"), { method: "POST" }),
};

export const adminApi = {
  users: {
    list: () => request<{ users: User[] }>(apiUrl("/admin/users")),
    updateRoles: (userId: string, roleIds: string[]) =>
      request<void>(apiUrl(`/admin/users/${userId}/roles`), { method: "POST", body: { roleIds } }),
  },
  roles: {
    list: () => request<{ roles: Role[] }>(apiUrl("/admin/roles")),
    create: (data: { name: string; description: string }) =>
      request<{ role: Role }>(apiUrl("/admin/roles"), { method: "POST", body: data }),
    delete: (roleId: string) => request<void>(apiUrl(`/admin/roles/${roleId}`), { method: "DELETE" }),
    permissions: {
      getAll: () => request<{ permissions: PermissionGroup }>(apiUrl("/admin/permissions")),
      getByRole: (roleId: string) =>
        request<{ permissions: Permission[] }>(apiUrl(`/admin/roles/${roleId}/permissions`)),
      update: (roleId: string, permissionIds: string[]) =>
        request<void>(apiUrl(`/admin/roles/${roleId}/permissions`), { method: "PUT", body: { permissionIds } }),
    },
  },
};

export const dashboardApi = {
  stats: () => request<{
    totalProjects: number;
    totalUsers: number;
    totalTasks: number;
    totalTimesheets: number;
    odooConnections: number;
  }>(apiUrl("/admin/stats")),
};

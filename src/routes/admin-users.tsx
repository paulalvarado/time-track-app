import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, Input, Label, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Badge } from "../components/ui";
import { Breadcrumb } from "../components/breadcrumb";
import { Route as adminLayout } from "../layouts/admin-layout";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/users",
  component: AdminUsersPage,
});

type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  roles: { id: string; name: string }[];
};

type Role = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
};

function AdminUsersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; isAdmin?: boolean } | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Edit user roles dialog
  const editUserRolesDialog = useDialog();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Check auth and fetch data
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (!data.user?.isAdmin) throw new Error("Not admin");
        setUser(data.user);
      })
      .catch(() => {
        navigate({ to: "/login" });
      });
  }, [navigate]);

  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {}
    setLoadingUsers(false);
  };

  // Fetch roles (for dialog)
  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setAllRoles(data.roles || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open edit user roles dialog
  const openEditUserRoles = async (u: User) => {
    setSelectedUser(u);
    setSelectedRoleIds(u.roles.map((r) => r.id));
    if (allRoles.length === 0) {
      await fetchRoles();
    }
    editUserRolesDialog.show();
  };

  // Save user roles
  const saveUserRoles = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: selectedRoleIds }),
      });
      if (res.ok) {
        editUserRolesDialog.close();
        fetchUsers();
      }
    } catch {}
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-page">
      <Breadcrumb items={[{ label: "Usuarios" }]} />

      <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Usuarios.
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            Gestiona los usuarios del sistema y sus roles asignados.
          </p>
        </div>

        {/* Users list */}
        <div className="space-y-4">
          {loadingUsers ? (
            <p className="text-text-secondary text-[14px]">Cargando usuarios...</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-[8px] border border-border bg-card p-4"
                >
                  <div>
                    <p className="text-[14px] font-medium text-text-primary">{u.name}</p>
                    <p className="text-[13px] text-text-secondary">{u.email}</p>
                    <div className="flex gap-1 mt-1">
                      {u.roles.map((r) => (
                        <Badge key={r.id}>{r.name}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openEditUserRoles(u)}>
                    Editar roles
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit User Roles Dialog ── */}
      <Dialog open={editUserRolesDialog.open} onClose={editUserRolesDialog.close}>
        <DialogHeader title={`Roles de ${selectedUser?.name ?? ""}`} onClose={editUserRolesDialog.close} />
        <DialogBody>
          <div className="space-y-2">
            {allRoles.map((r) => (
              <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(r.id)}
                  onChange={() => {
                    setSelectedRoleIds((prev) =>
                      prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                    );
                  }}
                  className="rounded border-border"
                />
                <span className="text-[14px] text-text-primary">{r.name}</span>
                {r.isSystem && <span className="text-[11px] text-text-secondary">(sistema)</span>}
              </label>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={editUserRolesDialog.close}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={saveUserRoles}>
            Guardar
          </Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

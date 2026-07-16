import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useEffect } from "react";
import { Button, Input, Label, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Badge } from "../components/ui";
import { Breadcrumb } from "../components/breadcrumb";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
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

type Permission = {
  id: string;
  key: string;
  name: string;
  group: string;
};

type PermissionGroup = Record<string, Permission[]>;

type Tab = "users" | "roles";

function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; isAdmin?: boolean } | null>(null);
  const [tab, setTab] = useState<Tab>("users");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Edit user roles dialog
  const editUserRolesDialog = useDialog();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Create role dialog
  const createRoleDialog = useDialog();
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Edit role permissions dialog
  const editRolePermsDialog = useDialog();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionGroup>({});
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

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

  // Fetch roles
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
        setAllRoles(data.roles || []);
      }
    } catch {}
    setLoadingRoles(false);
  };

  useEffect(() => {
    if (tab === "users") {
      fetchUsers();
    } else {
      fetchRoles();
    }
  }, [tab]);

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

  // Open create role dialog
  const handleOpenCreateRole = () => {
    setNewRoleName("");
    setNewRoleDesc("");
    createRoleDialog.show();
  };

  // Create role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName.trim(), description: newRoleDesc.trim() }),
      });
      if (res.ok) {
        createRoleDialog.close();
        fetchRoles();
      }
    } catch {}
  };

  // Delete role
  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) return;
    if (!window.confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRoles();
      }
    } catch {}
  };

  // Open edit role permissions
  const openEditPermissions = async (role: Role) => {
    setSelectedRole(role);
    setLoadingPerms(true);
    editRolePermsDialog.show();

    try {
      const permRes = await fetch("/api/admin/permissions");
      if (permRes.ok) {
        const permData = await permRes.json();
        setAllPermissions(permData.permissions || {});
      }

      const rolePermRes = await fetch(`/api/admin/roles/${role.id}/permissions`);
      if (rolePermRes.ok) {
        const rolePermData = await rolePermRes.json();
        setSelectedPermIds((rolePermData.permissions || []).map((p: Permission) => p.id));
      }
    } catch {}
    setLoadingPerms(false);
  };

  // Save role permissions
  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: selectedPermIds }),
      });
      if (res.ok) {
        editRolePermsDialog.close();
        fetchRoles();
      }
    } catch {}
  };

  // Toggle permission selection
  const togglePermission = (permId: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-page">
      <Breadcrumb items={[{ label: "Admin" }]} />

      <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.96px] text-text-primary">
            Administración.
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
            Gestiona usuarios, roles y permisos del sistema.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 text-[13px] font-medium leading-[18px] border-b-2 transition-colors ${
              tab === "users"
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setTab("roles")}
            className={`px-4 py-2 text-[13px] font-medium leading-[18px] border-b-2 transition-colors ${
              tab === "roles"
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Roles y Permisos
          </button>
        </div>

        {/* Users Tab */}
        {tab === "users" && (
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
        )}

        {/* Roles Tab */}
        {tab === "roles" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={handleOpenCreateRole}>
                + Nuevo rol
              </Button>
            </div>

            {loadingRoles ? (
              <p className="text-text-secondary text-[14px]">Cargando roles...</p>
            ) : (
              <div className="space-y-2">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-[8px] border border-border bg-card p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-text-primary">{r.name}</p>
                        {r.isSystem && <Badge>sistema</Badge>}
                      </div>
                      <p className="text-[13px] text-text-secondary">{r.description}</p>
                      <p className="text-[12px] text-text-secondary mt-1">
                        {r.permissionCount} permiso{r.permissionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditPermissions(r)}>
                        Permisos
                      </Button>
                      {!r.isSystem && (
                        <Button variant="danger" size="sm" onClick={() => handleDeleteRole(r)}>
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

      {/* ── Create Role Dialog ── */}
      <Dialog open={createRoleDialog.open} onClose={createRoleDialog.close}>
        <DialogHeader title="Nuevo rol" onClose={createRoleDialog.close} />
        <DialogBody>
          <div className="space-y-4">
            <div>
              <Label>Nombre del rol</Label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Ej: supervisor"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Descripción opcional"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={createRoleDialog.close}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateRole}>
            Crear rol
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ── Edit Role Permissions Dialog ── */}
      <Dialog open={editRolePermsDialog.open} onClose={editRolePermsDialog.close}>
        <DialogHeader title={`Permisos de "${selectedRole?.name ?? ""}"`} onClose={editRolePermsDialog.close} />
        <DialogBody>
          {loadingPerms ? (
            <p className="text-text-secondary text-[14px]">Cargando permisos...</p>
          ) : (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {Object.entries(allPermissions).map(([group, perms]) => (
                <div key={group}>
                  <p className="text-[13px] font-medium text-text-secondary uppercase tracking-wide mb-2">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={selectedPermIds.includes(p.id)}
                          onChange={() => togglePermission(p.id)}
                          className="rounded border-border"
                        />
                        <div>
                          <p className="text-[14px] text-text-primary">{p.name}</p>
                          <p className="text-[12px] text-text-secondary">{p.key}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={editRolePermsDialog.close}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={saveRolePermissions}>
            Guardar permisos
          </Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, Input, Label, Dialog, DialogHeader, DialogBody, DialogFooter, useDialog, Badge } from "../components/ui";
import { PageHeader } from "../components/page-header";
import { useSetBreadcrumb } from "../components/breadcrumb-context";
import { Route as adminLayout } from "../layouts/admin-layout";

export const Route = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/roles",
  component: AdminRolesPage,
});

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

function AdminRolesPage() {
  const navigate = useNavigate();

  useSetBreadcrumb([{ label: "Roles y Permisos" }]);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Create role dialog
  const createRoleDialog = useDialog();
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Edit role dialog
  const editRoleDialog = useDialog();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");

  // Edit role permissions dialog
  const editRolePermsDialog = useDialog();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionGroup>({});
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Check auth
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (!data.user?.isAdmin) throw new Error("Not admin");
      })
      .catch(() => {
        navigate({ to: "/login" });
      });
  }, [navigate]);

  // Fetch roles
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
    } catch {}
    setLoadingRoles(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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

  // Open edit role dialog
  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDesc(role.description);
    editRoleDialog.show();
  };

  // Update role
  const handleUpdateRole = async () => {
    if (!editingRole) return;
    if (!editRoleName.trim()) return;
    try {
      const res = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editRoleName.trim(), description: editRoleDesc.trim() }),
      });
      if (res.ok) {
        editRoleDialog.close();
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
      <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
        <PageHeader
          title="Roles y Permisos."
          description="Gestiona los roles del sistema y sus permisos asociados."
        />

        {/* Roles list */}
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
                    <Button variant="secondary" size="sm" onClick={() => handleOpenEditRole(r)}>
                      Editar
                    </Button>
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
      </div>

      {/* ── Create Role Dialog ── */}
      <Dialog open={createRoleDialog.open} onClose={createRoleDialog.close}>
        <DialogHeader title="Nuevo rol" onClose={createRoleDialog.close} />
        <DialogBody>
          <div className="space-y-4">
            <div>
              <Label>Slug (identificador único)</Label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value.replace(/\s+/g, "_").toLowerCase())}
                placeholder="Ej: supervisor"
              />
              <p className="text-[12px] text-text-muted mt-1">Se usará como identificador único. Sin espacios ni caracteres especiales.</p>
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

      {/* ── Edit Role Dialog ── */}
      <Dialog open={editRoleDialog.open} onClose={editRoleDialog.close}>
        <DialogHeader title={`Editar rol`} onClose={editRoleDialog.close} />
        <DialogBody>
          <div className="space-y-4">
            <div>
              <Label>Slug (identificador único)</Label>
              <Input
                value={editingRole?.isSystem ? editingRole.name : editRoleName}
                disabled={editingRole?.isSystem ?? false}
                onChange={(e) => setEditRoleName(e.target.value.replace(/\s+/g, "_").toLowerCase())}
                placeholder="ej: supervisor"
              />
              {editingRole?.isSystem ? (
                <p className="text-[12px] text-text-muted mt-1">Slug protegido. Los roles de sistema no pueden cambiar su identificador.</p>
              ) : (
                <p className="text-[12px] text-text-muted mt-1">El slug se usa como identificador único del rol.</p>
              )}
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={editRoleDesc}
                onChange={(e) => setEditRoleDesc(e.target.value)}
                placeholder="Descripción del rol"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={editRoleDialog.close}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleUpdateRole}>
            Guardar cambios
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

"use client";

import type { User as UserType } from "@prisma/client";
import { Search, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useGetUserPermissions,
  useUpdateUserPermissions,
} from "../../../queries/permissions";

type ManageUserPermissionsProps = {
  user: UserType;
  trigger: React.ReactNode;
  onSuccess?: () => void;
};

type UserPermission = {
  permissionId: string;
  mode: "GRANT" | "DENY";
  scopeJson?: unknown;
};

export default function ManageUserPermissions({
  user,
  trigger,
  onSuccess,
}: ManageUserPermissionsProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);

  const { data, isLoading, error } = useGetUserPermissions(user.id);
  const updateUserPermissionsMutation = useUpdateUserPermissions();

  const permissions = data?.data?.permissions || [];
  const existingUserPermissions = data?.data?.userPermissions || [];

  // Agrupar permissões por recurso
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    },
    {} as Record<string, typeof permissions>,
  );

  // Filtrar permissões por busca
  const filteredGroupedPermissions = Object.entries(groupedPermissions).reduce(
    (acc, [resource, perms]) => {
      const filteredPerms = perms.filter(
        (permission) =>
          permission.name.toLowerCase().includes(search.toLowerCase()) ||
          permission.description
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          permission.action.toLowerCase().includes(search.toLowerCase()),
      );
      if (filteredPerms.length > 0) {
        acc[resource] = filteredPerms;
      }
      return acc;
    },
    {} as Record<string, typeof permissions>,
  );

  useEffect(() => {
    if (open && existingUserPermissions.length > 0) {
      setUserPermissions(
        existingUserPermissions.map((perm) => ({
          permissionId: perm.permissionId,
          mode: perm.mode as "GRANT" | "DENY",
          scopeJson: perm.scopeJson,
        })),
      );
    } else if (open) {
      setUserPermissions([]);
    }
  }, [open, existingUserPermissions]);

  const getPermissionMode = (permissionId: string): "GRANT" | "DENY" | null => {
    const userPerm = userPermissions.find(
      (up) => up.permissionId === permissionId,
    );
    return userPerm ? userPerm.mode : null;
  };

  const handlePermissionToggle = (
    permissionId: string,
    mode: "GRANT" | "DENY",
  ) => {
    setUserPermissions((prev) => {
      const existing = prev.find((up) => up.permissionId === permissionId);
      if (existing) {
        if (existing.mode === mode) {
          // Remove a permissão se já existe com o mesmo modo
          return prev.filter((up) => up.permissionId !== permissionId);
        } else {
          // Atualiza o modo
          return prev.map((up) =>
            up.permissionId === permissionId ? { ...up, mode } : up,
          );
        }
      } else {
        // Adiciona nova permissão
        return [...prev, { permissionId, mode }];
      }
    });
  };

  const handleSelectAll = (mode: "GRANT" | "DENY") => {
    const allPermissionIds = permissions.map((p) => p.id);
    setUserPermissions(
      allPermissionIds.map((permissionId) => ({ permissionId, mode })),
    );
  };

  const handleClearAll = () => {
    setUserPermissions([]);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const response = await updateUserPermissionsMutation.mutateAsync({
      userId: user.id,
      permissions: userPermissions,
    });

    if (response.success) {
      onSuccess?.();
      toast.success(response.message);
      setOpen(false);
    } else {
      toast.error(response.message);
    }
    setIsSubmitting(false);
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar permissões</DialogTitle>
            <DialogDescription>
              Erro ao carregar permissões. Tente novamente.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gerenciar permissões do usuário
          </DialogTitle>
          <DialogDescription>
            Gerencie as permissões do usuário "{user.name}" ({user.email})
            <br />
            <span className="text-xs text-muted-foreground">
              Permissões de usuário sobrescrevem as permissões dos cargos
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Busca e controles */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar permissões..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll("GRANT")}
            >
              Conceder todas
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll("DENY")}
            >
              Negar todas
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
            >
              Limpar seleção
            </Button>
          </div>

          {/* Lista de permissões */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map(() => (
                  <div
                    key={`user-loading-group-${crypto.randomUUID()}`}
                    className="space-y-2"
                  >
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                    <div className="space-y-1">
                      {Array.from({ length: 3 }).map(() => (
                        <div
                          key={`user-loading-perm-${crypto.randomUUID()}`}
                          className="h-8 bg-muted rounded animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : Object.keys(filteredGroupedPermissions).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma permissão encontrada
              </div>
            ) : (
              Object.entries(filteredGroupedPermissions).map(
                ([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {resource}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({perms.length} permissão
                        {perms.length !== 1 ? "ões" : ""})
                      </span>
                    </div>
                    <div className="space-y-1 ml-4">
                      {perms.map((permission) => {
                        const currentMode = getPermissionMode(permission.id);
                        return (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`grant-${permission.id}`}
                                checked={currentMode === "GRANT"}
                                onCheckedChange={() =>
                                  handlePermissionToggle(permission.id, "GRANT")
                                }
                              />
                              <Label
                                htmlFor={`grant-${permission.id}`}
                                className="text-sm text-green-600 cursor-pointer"
                              >
                                Conceder
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`deny-${permission.id}`}
                                checked={currentMode === "DENY"}
                                onCheckedChange={() =>
                                  handlePermissionToggle(permission.id, "DENY")
                                }
                              />
                              <Label
                                htmlFor={`deny-${permission.id}`}
                                className="text-sm text-red-600 cursor-pointer"
                              >
                                Negar
                              </Label>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    {permission.name}
                                  </div>
                                  {permission.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {permission.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {permission.action}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {permission.code}
                                  </span>
                                  {currentMode && (
                                    <Badge
                                      variant={
                                        currentMode === "GRANT"
                                          ? "default"
                                          : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {currentMode === "GRANT"
                                        ? "Concedida"
                                        : "Negada"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Separator />
                  </div>
                ),
              )
            )}
          </div>

          {/* Resumo */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              {userPermissions.length} permissões configuradas de{" "}
              {permissions.length} disponíveis
            </div>
            <div className="flex items-center gap-2">
              {userPermissions.length > 0 && (
                <>
                  <Badge variant="default" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {userPermissions.filter((p) => p.mode === "GRANT").length}{" "}
                    concedidas
                  </Badge>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {userPermissions.filter((p) => p.mode === "DENY").length}{" "}
                    negadas
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Salvar permissões
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

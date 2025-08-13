"use client";

import type { Role } from "@prisma/client";
import { Check, Search, Shield } from "lucide-react";
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
  useGetRolePermissions,
  useUpdateRolePermissions,
} from "../../../queries/permissions";

type ManageRolePermissionsProps = {
  role: Role;
  trigger: React.ReactNode;
  onSuccess?: () => void;
};

export default function ManageRolePermissions({
  role,
  trigger,
  onSuccess,
}: ManageRolePermissionsProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data, isLoading, error } = useGetRolePermissions(role.id);
  const updateRolePermissionsMutation = useUpdateRolePermissions();

  const permissions = data?.data?.permissions || [];

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
    if (open && data?.data?.assignedPermissionIds) {
      setSelectedPermissions([...data.data.assignedPermissionIds]);
    } else if (open) {
      setSelectedPermissions([]);
    }
  }, [open, data?.data?.assignedPermissionIds]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAll = () => {
    const allPermissionIds = permissions.map((p) => p.id);
    setSelectedPermissions(allPermissionIds);
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const response = await updateRolePermissionsMutation.mutateAsync({
      roleId: role.id,
      permissionIds: selectedPermissions,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciar permissões do função
          </DialogTitle>
          <DialogDescription>
            Gerencie as permissões do função "{role.name}" ({role.slug})
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
              onClick={handleSelectAll}
            >
              Selecionar todas
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
                  <div key={`loading-group-${crypto.randomUUID()}`} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                    <div className="space-y-1">
                      {Array.from({ length: 3 }).map(() => (
                        <div
                          key={`loading-perm-${crypto.randomUUID()}`}
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
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(
                              permission.id,
                            )}
                            onCheckedChange={() =>
                              handlePermissionToggle(permission.id)
                            }
                          />
                          <Label
                            htmlFor={permission.id}
                            className="flex-1 cursor-pointer"
                          >
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
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
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
              {selectedPermissions.length} de {permissions.length} permissões
              selecionadas
            </div>
            <div className="flex items-center gap-2">
              {selectedPermissions.length > 0 && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {selectedPermissions.length}
                </Badge>
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

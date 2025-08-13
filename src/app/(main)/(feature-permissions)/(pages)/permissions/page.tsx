import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/auth/permissions";
import { CreatePermission, ListPermissions } from "./_components";

export default async function PermissionsPage() {
  if (!(await can("permission:read"))) {
    redirect("/dashboard?error=no_permission");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissões</h1>
          <p className="text-muted-foreground">
            Gerencie as permissões do sistema.
          </p>
        </div>
        <CreatePermission
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova permissão
            </Button>
          }
        />
      </div>

      <Suspense fallback={<PermissionsSkeleton />}>
        <ListPermissions />
      </Suspense>
    </div>
  );
}

function PermissionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={`skeleton-${crypto.randomUUID()}`} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

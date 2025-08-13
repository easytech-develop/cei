import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import CreateRole from "./_components/create-role";
import ListRoles from "./_components/list-roles";

export const metadata: Metadata = {
  title: "Funções",
  description: "Gerencie os funções e funções do sistema.",
};

export default async function RolesPage() {
  if (!(await can("role:read"))) {
    redirect("/dashboard?error=no_permission");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funções</h1>
          <p className="text-muted-foreground">
            Gerencie os funções e funções do sistema.
          </p>
        </div>
        <CreateRole
          trigger={
            <Button size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <div className="grid gap-4">
        <ListRoles />
      </div>
    </div>
  );
}

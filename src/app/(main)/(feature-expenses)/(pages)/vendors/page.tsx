import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import CreateVendor from "./_components/create-vendor";
import ListVendors from "./_components/list-vendors";

export const metadata: Metadata = {
  title: "Fornecedores",
  description: "Gerencie seus fornecedores.",
};

export default async function VendorsPage() {
  if (!(await can("vendor:read"))) {
    redirect("/dashboard?error=no_permission");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores.
          </p>
        </div>
        <CreateVendor
          trigger={
            <Button size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <div className="grid gap-4">
        <ListVendors />
      </div>
    </div>
  );
}

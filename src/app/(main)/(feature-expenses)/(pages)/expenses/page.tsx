import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import CreateExpense from "./_components/create-expense";
import ListExpenses from "./_components/list-expenses";

export const metadata: Metadata = {
  title: "Despesas",
  description: "Gerencie suas despesas e pagamentos.",
};

export default async function ExpensesPage() {
  if (!(await can("expense:read"))) {
    redirect("/dashboard?error=no_permission");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">
            Gerencie suas despesas e pagamentos.
          </p>
        </div>
        <CreateExpense
          trigger={
            <Button size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <div className="grid gap-4">
        <ListExpenses />
      </div>
    </div>
  );
}

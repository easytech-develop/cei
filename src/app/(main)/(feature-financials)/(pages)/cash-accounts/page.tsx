import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { CreateCashAccount, ListCashAccounts } from "./_components";

export const metadata: Metadata = {
  title: "Contas Bancárias",
  description: "Gerencie suas contas bancárias e financeiras.",
};

export default async function CashAccountsPage() {
  // TODO: Implementar verificação de permissão quando as permissões de cash_account forem criadas
  // if (!(await can("cash_account:read"))) {
  // 	redirect("/dashboard?error=no_permission");
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas Bancárias</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias e financeiras.
          </p>
        </div>
        <CreateCashAccount
          trigger={
            <Button size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <div className="grid gap-4">
        <ListCashAccounts />
      </div>
    </div>
  );
}

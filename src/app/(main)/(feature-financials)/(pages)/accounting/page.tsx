import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateAccount from "./_components/create-account";
import ListAccounts from "./_components/list-accounts";

export default function AccountingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contabilidade</h1>
          <p className="text-muted-foreground">
            Gerencie o plano de contas contábil da empresa.
          </p>
        </div>
        <CreateAccount
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          }
        />
      </div>
      <ListAccounts />
    </div>
  );
}

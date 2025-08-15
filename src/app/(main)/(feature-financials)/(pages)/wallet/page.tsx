import {
  Banknote,
  Building2,
  DollarSign,
  PiggyBank,
  PlusIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCashAccounts } from "../../server/cash-accounts";
import { CreateDocument, ListDocuments } from "./_components";

export const metadata: Metadata = {
  title: "Carteira",
  description: "Gerencie suas movimentações financeiras.",
};

export default async function WalletPage() {
  // TODO: Implementar verificação de permissão quando as permissões de contact forem criadas
  // if (!(await can("contact:read"))) {
  // 	redirect("/dashboard?error=no_permission");
  // }
  const cashAccounts = await getCashAccounts({
    meta: {
      page: 1,
      limit: 100,
    },
  });

  const accounts = cashAccounts.data?.cashAccounts || [];
  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.openingBalance),
    0,
  );
  const positiveAccounts = accounts.filter(
    (account) => Number(account.openingBalance) > 0,
  );
  const negativeAccounts = accounts.filter(
    (account) => Number(account.openingBalance) < 0,
  );

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "CHECKING":
        return Banknote;
      case "SAVINGS":
        return PiggyBank;
      case "INVESTMENT":
        return TrendingUp;
      case "CASH":
        return Wallet;
      case "OTHER":
        return Building2;
      default:
        return Building2;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case "CHECKING":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "SAVINGS":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "INVESTMENT":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "CASH":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "OTHER":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "CHECKING":
        return "Conta Corrente";
      case "SAVINGS":
        return "Poupança";
      case "INVESTMENT":
        return "Investimento";
      case "CASH":
        return "Caixa";
      case "OTHER":
        return "Outro";
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(amount));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carteira</h1>
          <p className="text-muted-foreground">
            Gerencie suas movimentações financeiras.
          </p>
        </div>
        <CreateDocument
          trigger={
            <Button size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <div className="grid gap-6">
        {/* Cash Accounts */}
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Saldo Total
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        totalBalance >= 0
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {formatCurrency(totalBalance)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Contas Positivas
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {positiveAccounts.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Contas Negativas
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {negativeAccounts.length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Contas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const Icon = getAccountIcon(account.type);
              const balance = Number(account.openingBalance);
              const isPositive = balance >= 0;

              return (
                <Card
                  key={account.id}
                  className={cn(
                    "group hover:shadow-lg transition-all duration-200 border-l-4",
                    isPositive
                      ? "border-l-green-500 hover:border-l-green-600"
                      : "border-l-red-500 hover:border-l-red-600",
                  )}
                >
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            getAccountColor(account.type),
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {account.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getAccountTypeLabel(account.type)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          account.isActive
                            ? "border-green-500/20 text-green-700 dark:text-green-400"
                            : "border-red-500/20 text-red-700 dark:text-red-400",
                        )}
                      >
                        {account.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Saldo Atual
                        </span>
                        <span
                          className={cn(
                            "text-lg font-bold",
                            isPositive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400",
                          )}
                        >
                          {formatCurrency(balance)}
                        </span>
                      </div>

                      {account.agency && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            Agência: {account.agency}
                          </p>
                        </div>
                      )}

                      {account.accountNumber && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            Conta: {account.accountNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Estado Vazio */}
          {accounts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Nenhuma conta encontrada
                    </h3>
                    <p className="text-muted-foreground">
                      Adicione suas contas para começar a gerenciar suas
                      finanças.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <ListDocuments />
      </div>
    </div>
  );
}

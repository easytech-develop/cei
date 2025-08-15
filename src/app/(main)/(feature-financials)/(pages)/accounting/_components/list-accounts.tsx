"use client";

import type { AccountType } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAccounts } from "../../../queries/accounts";
import CreateAccount from "./create-account";
import DeleteAccount from "./delete-account";
import UpdateAccount from "./update-account";

const accountTypeLabels: Record<AccountType, string> = {
  ASSET: "Ativo",
  LIABILITY: "Passivo",
  EQUITY: "Patrimônio Líquido",
  REVENUE: "Receita",
  EXPENSE: "Despesa",
};

const accountTypeColors: Record<AccountType, string> = {
  ASSET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  LIABILITY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  EQUITY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  REVENUE:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  EXPENSE:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export default function ListAccounts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "">("");
  const limit = 10;

  const { data, isLoading, error } = useGetAccounts({
    meta: { page, limit },
    filters: {
      search: search || undefined,
      type: typeFilter || undefined,
    },
  });

  if (error) {
    toast.error("Erro ao carregar contas");
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro</CardTitle>
          <CardDescription>
            Ocorreu um erro ao carregar as contas contábeis.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const accounts = data?.data?.accounts || [];
  const meta = data?.data?.meta;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as contas contábeis por nome, código ou tipo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Buscar
              </label>
              <Input
                id="search"
                placeholder="Buscar por nome ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type-filter" className="text-sm font-medium">
                Tipo de Conta
              </label>
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as AccountType | "")
                }
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contas Contábeis</CardTitle>
              <CardDescription>
                Lista de todas as contas do plano de contas.
              </CardDescription>
            </div>
            <CreateAccount trigger={<Button size="sm">Nova Conta</Button>} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando contas...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma conta encontrada.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Conta Pai</TableHead>
                    <TableHead>Relacionamentos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.name}
                      </TableCell>
                      <TableCell>{account.code || "-"}</TableCell>
                      <TableCell>
                        <Badge className={accountTypeColors[account.type]}>
                          {accountTypeLabels[account.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {account.parent ? (
                          <div>
                            <div className="font-medium">
                              {account.parent.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {account.parent.code || "Sem código"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Conta Raiz
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          Sem informações de relacionamentos
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <UpdateAccount account={account} />
                          <DeleteAccount account={account} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta?.totalPages && meta.totalPages > 1 && (
                <div className="flex items-center gap-2 justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {page} de {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= meta.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

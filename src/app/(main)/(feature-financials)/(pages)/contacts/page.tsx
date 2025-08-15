import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { CreateContact, ListContacts } from "./_components";

export const metadata: Metadata = {
  title: "Contatos",
  description: "Gerencie seus contatos, clientes e fornecedores.",
};

export default async function ContactsPage() {
  // TODO: Implementar verificação de permissão quando as permissões de contact forem criadas
  // if (!(await can("contact:read"))) {
  // 	redirect("/dashboard?error=no_permission");
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie seus contatos, clientes e fornecedores.
          </p>
        </div>
        <CreateContact
          trigger={
            <Button size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <div className="grid gap-4">
        <ListContacts />
      </div>
    </div>
  );
}

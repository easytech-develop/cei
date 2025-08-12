import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { can } from "@/lib/auth/permissions";

export default async function ExpensesPage() {
	const session = await getSession();

	if (!session?.user?.id) {
		redirect("/auth/sign-in");
	}

	if (!(await can("expense:read"))) {
		redirect("/dashboard?error=no_permission");
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
				<p className="text-muted-foreground">
					Gerencie suas despesas e acompanhe seus gastos.
				</p>
			</div>

			<div className="grid gap-4">
				{/* Conteúdo da página de despesas será implementado aqui */}
				<div className="rounded-lg border p-4">
					<p className="text-center text-muted-foreground">
						Lista de despesas será exibida aqui
					</p>
				</div>
			</div>
		</div>
	);
}

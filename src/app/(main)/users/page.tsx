import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { can } from "@/lib/auth/permissions";
import { prisma } from "@/server/prisma";

export const metadata: Metadata = {
	title: "Usuários",
	description: "Gerencie seus usuários e suas permissões.",
};

export default async function UsersPage({
	searchParams,
}: {
	searchParams: Promise<{
		page?: string;
		limit?: string;
	}>;
}) {
	const { page = 1, limit = 10 } = await searchParams;

	if (!(await can("user:read"))) {
		redirect("/dashboard?error=no_permission");
	}

	const users = (await prisma.user.findMany({
		skip: (Number(page) - 1) * Number(limit),
		take: Number(limit),
		include: {
			Roles: {
				include: {
					Role: true,
				},
			},
		},
	})).map((user) => ({
		...user,
		roles: user.Roles.map((role) => role.Role),
	}));

	console.log(users);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
				<p className="text-muted-foreground">
					Gerencie seus usuários e suas permissões.
				</p>
			</div>

			<div className="grid gap-4">
				{/* Conteúdo da página de despesas será implementado aqui */}
				<div className="rounded-lg border p-4">
					<p className="text-center text-muted-foreground">
						Lista de usuários será exibida aqui
					</p>
				</div>
			</div>
		</div>
	);
}

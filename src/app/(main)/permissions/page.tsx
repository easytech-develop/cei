import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { can } from "@/lib/auth/permissions";
import { prisma } from "@/server/prisma";
import { columns } from "./_components/columns";

export const metadata: Metadata = {
	title: "Permissões",
	description: "Gerencie as permissões do sistema.",
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

	if (!(await can("permission:read"))) {
		redirect("/dashboard?error=no_permission");
	}

	const permissions = (await prisma.permission.findMany({
		skip: (Number(page) - 1) * Number(limit),
		take: Number(limit),
		select: {
			id: true,
			name: true,
			description: true,
			resource: true,
			action: true,
			code: true,
		},
	}));

	const total = await prisma.permission.count();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Permissões</h1>
				<p className="text-muted-foreground">
					Gerencie suas permissões.
				</p>
			</div>

			<div className="grid gap-4">
				<DataTable columns={columns} data={permissions} meta={{
					page: Number(page),
					limit: Number(limit),
					total,
					totalPages: Math.ceil(total / Number(limit)),
				}} />
			</div>
		</div>
	);
}

'use client'

import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{
	id: string;
	name: string;
	email: string;
	roles: {
		name: string;
		id: string;
		slug: string;
	}[];
}>[] = [
		{
			accessorKey: "name",
			header: "Nome",
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "roles",
			header: "Roles",
			cell: ({ row }) => {
				return (
					<div>
						{row.original.roles.map((role) => role.name).join(", ")}
					</div>
				)
			},
		},
	]

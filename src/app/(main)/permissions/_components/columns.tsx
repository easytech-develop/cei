'use client'

import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{
	id: string;
	name: string;
	description: string | null;
	resource: string;
	action: string;
	code: string;
}>[] = [
		{
			accessorKey: "name",
			header: "Nome",
		},
		{
			accessorKey: "description",
			header: "Descrição",
		},
		{
			accessorKey: "resource",
			header: "Recurso",
		},
	]

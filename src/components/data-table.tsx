"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "./ui/skeleton";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	loading?: boolean;
	meta?: {
		page: number;
		limit: number;
		total?: number;
		totalPages?: number;
	};
	setMeta?: (meta: { page: number; limit: number }) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	loading = false,
	meta,
	setMeta,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	// Função para gerar os números das páginas
	const generatePageNumbers = () => {
		if (!meta?.totalPages) return [];

		const currentPage = meta.page;
		const totalPages = meta.totalPages;
		const pages: (number | string)[] = [];

		// Sempre mostrar primeira página
		pages.push(1);

		// Se há mais de 7 páginas, usar ellipsis
		if (totalPages <= 7) {
			for (let i = 2; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Lógica para páginas com ellipsis
			if (currentPage <= 4) {
				for (let i = 2; i <= 5; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 3) {
				pages.push("ellipsis");
				for (let i = totalPages - 4; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push("ellipsis");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (!meta || !setMeta || !meta.totalPages || meta.totalPages <= 1) {
		return (
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				{loading ? (
					<TableBody>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-48 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-48 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-64 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-32 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-48 h-4" />
								</TableCell>
							))}
						</TableRow>
					</TableBody>
				) : (
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Nenhum dado encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				)}
			</Table>
		);
	}

	return (
		<div className="grid gap-4">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				{loading ? (
					<TableBody>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-48 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-48 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-64 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-32 h-4" />
								</TableCell>
							))}
						</TableRow>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={`${Math.random()}-${column.id}-loading`}>
									<Skeleton className="w-full max-w-48 h-4" />
								</TableCell>
							))}
						</TableRow>
					</TableBody>
				) : (
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Nenhum dado encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				)}
			</Table>
			{meta && setMeta && meta.totalPages && meta.totalPages > 1 && (
				<div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="text-sm text-muted-foreground">
						{meta.total && (
							<span>
								{(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}
							</span>
						)}
					</div>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (meta.page > 1) {
											setMeta({ page: meta.page - 1, limit: meta.limit });
										}
									}}
									className={
										meta.page <= 1 ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>
							{generatePageNumbers().map((page) => (
								<PaginationItem key={`page-${page}`}>
									{page === "ellipsis" ? (
										<PaginationEllipsis />
									) : (
										<PaginationLink
											href="#"
											isActive={page === meta.page}
											onClick={(e) => {
												e.preventDefault();
												setMeta({ page: page as number, limit: meta.limit });
											}}
										>
											{page}
										</PaginationLink>
									)}
								</PaginationItem>
							))}
							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (meta.page < (meta.totalPages ?? 1)) {
											setMeta({ page: meta.page + 1, limit: meta.limit });
										}
									}}
									className={
										meta.page >= (meta.totalPages ?? 1)
											? "pointer-events-none opacity-50"
											: ""
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}

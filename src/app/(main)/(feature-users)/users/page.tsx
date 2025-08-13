import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import CreateUser from "./_components/create-user";
import ListUsers from "./_components/list-users";

export const metadata: Metadata = {
	title: "Usuários",
	description: "Gerencie seus usuários e suas permissões.",
};

export default async function UsersPage() {
	if (!(await can("user:read"))) {
		redirect("/dashboard?error=no_permission");
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
					<p className="text-muted-foreground">
						Gerencie seus usuários e suas permissões.
					</p>
				</div>
				<CreateUser
					trigger={
						<Button size="icon">
							<PlusIcon className="h-4 w-4" />
						</Button>
					}
				/>
			</div>
			<div className="grid gap-4">
				<ListUsers />
			</div>
		</div>
	);
}

import type React from "react";
import { Separator } from "~/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { auth, signIn } from "~/server/auth";
import { DashboardSidebar } from "./_components/sidebar";

export default async function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();
	if (!session) await signIn();

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 border-b">
					<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mx-2 data-[orientation=vertical]:h-4"
						/>
						<h1 className="font-medium text-base">
							Welcome, {session?.user.email}
						</h1>
					</div>
				</header>
				<div className="px-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

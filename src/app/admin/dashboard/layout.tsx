import type React from "react";
import { DashboardSidebar } from "~/components/dashboard/sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { auth, signIn } from "~/server/auth";

export default async function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();
	if (!session) await signIn();

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}

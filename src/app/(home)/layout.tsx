import { SessionProvider } from "next-auth/react";
import type React from "react";
import { SidebarProvider } from "~/components/ui/sidebar";
import { PageSidebar } from "./_components/page-sidebar";

export default function HomeLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SessionProvider>
			<SidebarProvider className="flex min-h-screen w-full flex-row">
				<PageSidebar />
				<div className="w-full p-4">{children}</div>
			</SidebarProvider>
		</SessionProvider>
	);
}

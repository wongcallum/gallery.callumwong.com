import type React from "react";
import { Sidebar, SidebarContent } from "~/components/ui/sidebar";
import { PageSwitcher } from "../_components/page-switcher";

export default function CollectionsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<Sidebar>
				<SidebarContent>
					<PageSwitcher selected="collections" />
				</SidebarContent>
			</Sidebar>
			<div className="w-full p-4">{children}</div>
		</>
	);
}

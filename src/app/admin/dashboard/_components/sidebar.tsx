"use client";

import { authClient } from "~/lib/auth-client";
import { Button } from "../../../../components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../../../../components/ui/sidebar";

const items = [
	{
		title: "Collections",
		url: "/admin/dashboard/collections",
	},
	{
		title: "Tags",
		url: "/admin/dashboard/tags",
	},
	{
		title: "Import",
		url: "/admin/dashboard/import",
	},
];

export function DashboardSidebar() {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Gallery</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<Button
					className="w-full"
					onClick={async () => {
						await authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									window.location.href = "/admin/login";
								},
							},
						});
					}}
				>
					Sign Out
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}

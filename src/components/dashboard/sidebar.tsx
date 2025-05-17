import { signOut } from "~/server/auth";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarFooter,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../ui/sidebar";
import { Button } from "../ui/button";

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
		title: "Photos",
		url: "/admin/dashboard/photos",
	},
	{
		title: "Import",
		url: "/admin/dashboard/import",
	},
	{
		title: "Storage",
		url: "/admin/dashboard/storage",
	},
];

export async function DashboardSidebar() {
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
				<form
					action={async () => {
						"use server";
						await signOut();
					}}
				>
					<Button type="submit" className="w-full">
						Sign Out
					</Button>
				</form>
			</SidebarFooter>
		</Sidebar>
	);
}

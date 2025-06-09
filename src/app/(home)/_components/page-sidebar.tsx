"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
} from "~/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import TagsFilter from "./tags-filter";

export function PageSidebar() {
	const segments = useSelectedLayoutSegments();

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Browse by</SidebarGroupLabel>
					<Tabs defaultValue={segments[0]}>
						<TabsList className="w-full">
							<TabsTrigger value="collections" asChild>
								<Link href="/collections">Collections</Link>
							</TabsTrigger>
							<TabsTrigger value="tags" asChild>
								<Link href="/tags">Tags</Link>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</SidebarGroup>
				{segments[0] === "tags" && <TagsFilter />}
			</SidebarContent>
		</Sidebar>
	);
}

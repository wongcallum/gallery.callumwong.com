"use client";

import Link from "next/link";
import { SidebarGroup, SidebarGroupLabel } from "~/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export function PageSwitcher({ selected }: { selected: string }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Browse by</SidebarGroupLabel>
			<Tabs defaultValue={selected}>
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
	);
}

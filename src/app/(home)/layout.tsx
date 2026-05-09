"use client";

import Link from "next/link";
import type React from "react";
import { ThemeToggle } from "~/components/theme-toggle";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function HomeLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex-col">
			<SidebarProvider className="flex w-full flex-row">
				{children}
			</SidebarProvider>
			<footer className="sticky right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-center border-t bg-background p-1 text-center text-foreground md:flex-row md:gap-x-8">
				<Link href="https://callumwong.com" className="text-blue-600">
					Back to callumwong.com
				</Link>
				<span>© {new Date().getFullYear()} Callum Wong</span>
				{process.env.NODE_ENV !== "production" && (
					<span className="text-red-600">DEVELOPMENT BUILD</span>
				)}
				<ThemeToggle />
			</footer>
		</div>
	);
}

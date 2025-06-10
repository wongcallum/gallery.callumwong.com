import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import type React from "react";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function HomeLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex-col">
			<SessionProvider>
				<SidebarProvider className="flex w-full flex-row">
					{children}
				</SidebarProvider>
			</SessionProvider>
			<footer className="sticky right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-center border-t bg-white p-1 text-center text-foreground md:flex-row md:gap-x-8">
				<Link href="https://callumwong.com" className="text-blue-600">
					Back to callumwong.com
				</Link>
				<span>© {new Date().getFullYear()} Callum Wong</span>
				<span className="text-red-600">
					WORK IN PROGRESS, THINGS WILL BREAK
				</span>
			</footer>
		</div>
	);
}

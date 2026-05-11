import "~/styles/globals.css";

import type { Metadata } from "next";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "~/components/theme-provider";
import { TooltipProvider } from "~/components/ui/tooltip";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "gallery.callumwong.com",
	description: "Gallery - callumwong.com",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<NuqsAdapter>
						<TRPCReactProvider>
							<TooltipProvider>{children}</TooltipProvider>
						</TRPCReactProvider>
					</NuqsAdapter>
				</ThemeProvider>
			</body>
		</html>
	);
}

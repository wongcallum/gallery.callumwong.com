import "~/styles/globals.css";

import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";

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
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}

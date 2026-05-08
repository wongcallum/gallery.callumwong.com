"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="size-4"
			onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
		>
			{resolvedTheme === "dark" ? <Moon /> : <Sun />}
		</Button>
	);
}

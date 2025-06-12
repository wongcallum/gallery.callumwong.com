"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	useEffect(() => {
		if (typeof window !== "undefined") {
			redirect(`/${localStorage.getItem("lastPage") || "collections"}`);
		}
	}, []);
}

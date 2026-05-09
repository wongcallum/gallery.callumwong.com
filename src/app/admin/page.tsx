import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function Admin() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user) {
		redirect("/admin/dashboard/collections");
	} else {
		redirect("/admin/login");
	}
}

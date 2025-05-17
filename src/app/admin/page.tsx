import { redirect } from "next/navigation";
import { auth, signIn } from "~/server/auth";

export default async function Admin() {
	const session = await auth();

	if (session?.user) {
		redirect("/admin/dashboard/collections");
	} else {
		await signIn(undefined, {
			redirectTo: "/admin/dashboard/collections",
		});
	}
}

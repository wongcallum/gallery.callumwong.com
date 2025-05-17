import Link from "next/link";
import { Button } from "~/components/ui/button";
import { auth, signIn, signOut } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Admin() {
	const session = await auth();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	} else {
		await signIn(undefined, {
			redirectTo: "/admin",
		});
	}

	return (
		<HydrateClient>
			<form
				action={async () => {
					"use server";
					await signOut();
				}}
			>
				<Button type="submit">Sign Out</Button>
			</form>
		</HydrateClient>
	);
}

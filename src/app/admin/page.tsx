import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Admin() {
	const session = await auth();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
				{session ? "Sign out" : "Sign in"}
			</Link>
		</HydrateClient>
	);
}

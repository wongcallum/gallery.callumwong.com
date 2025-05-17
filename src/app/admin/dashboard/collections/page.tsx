import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { auth, signIn, signOut } from "~/server/auth";

export default async function Admin() {
	const session = await auth();

	return <>{JSON.stringify(session, null, 2)}</>;
}

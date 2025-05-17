import { redirect } from "next/navigation";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { auth, signIn, signOut } from "~/server/auth";
import { columns } from "./columns";

export default async function CollectionsPage() {
	const session = await auth();

	return (
		<DataTable
			columns={columns}
			data={[
				{
					name: "Japan 2023-24",
					description: "Japan",
					images: 1,
					location: "Japan",
				},
			]}
		/>
	);
}

"use client";

import { useState } from "react";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { CreateCollectionDialog } from "./_components/create-edit-collection-dialog";
import { columns } from "./columns";

export default function CollectionsPage() {
	const collections = api.collections.all.useQuery();

	const [open, setOpen] = useState(false);

	return (
		<DataTable
			filterPlaceholder="Filter collections..."
			filterColumn="name"
			columns={columns}
			data={collections.data || []}
		>
			<Button onClick={() => setOpen(true)}>New collection</Button>
			<CreateCollectionDialog open={open} setOpen={setOpen} />
		</DataTable>
	);
}

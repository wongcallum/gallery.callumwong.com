"use client";

import { useState } from "react";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { CreateTagDialog } from "./_components/create-edit-tag-dialog";
import { columns } from "./columns";

export default function TagsPage() {
	const tags = api.tags.withCount.useQuery();

	const [open, setOpen] = useState(false);

	return (
		<DataTable
			filterPlaceholder="Filter tags..."
			filterColumn="name"
			columns={columns}
			data={tags.data || []}
		>
			<Button onClick={() => setOpen(true)}>Define tag</Button>
			<CreateTagDialog open={open} setOpen={setOpen} />
		</DataTable>
	);
}

"use client";

import { useState } from "react";
import { SortableDataTable } from "~/components/sortable-data-table";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { CreateCollectionDialog } from "./_components/create-edit-collection-dialog";
import { columns } from "./columns";

export default function CollectionsPage() {
	const utils = api.useUtils();
	const collections = api.collections.all.useQuery();

	const reorderMutation = api.collections.reorder.useMutation({
		async onMutate({ id, beforeId, afterId }) {
			await utils.collections.all.cancel();
			const prev = utils.collections.all.getData();
			if (prev) {
				const oldIdx = prev.findIndex((c) => c.id === id);
				if (oldIdx !== -1) {
					const anchorId = afterId ?? beforeId;
					const anchorIdx = anchorId
						? prev.findIndex((c) => c.id === anchorId)
						: prev.length - 1;
					let newIdx: number;
					if (afterId != null) {
						newIdx = oldIdx < anchorIdx ? anchorIdx - 1 : anchorIdx;
					} else if (beforeId != null) {
						newIdx = oldIdx < anchorIdx ? anchorIdx : anchorIdx + 1;
					} else {
						newIdx = oldIdx;
					}
					const next = prev.slice();
					const [moved] = next.splice(oldIdx, 1);
					if (moved) next.splice(newIdx, 0, moved);
					utils.collections.all.setData(undefined, next);
				}
			}
			return { prev };
		},
		onError(_err, _vars, ctx) {
			if (ctx?.prev) utils.collections.all.setData(undefined, ctx.prev);
		},
		onSettled() {
			utils.collections.all.invalidate();
		},
	});

	const [open, setOpen] = useState(false);

	return (
		<SortableDataTable
			filterPlaceholder="Filter collections..."
			filterColumn="name"
			columns={columns}
			data={collections.data || []}
			onReorder={({ activeId, beforeId, afterId }) =>
				reorderMutation.mutate({ id: activeId, beforeId, afterId })
			}
		>
			<Button onClick={() => setOpen(true)}>New collection</Button>
			<CreateCollectionDialog open={open} setOpen={setOpen} />
		</SortableDataTable>
	);
}

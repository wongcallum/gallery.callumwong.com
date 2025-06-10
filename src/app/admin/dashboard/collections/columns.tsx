"use client";

import type { ColumnDef as CollectionColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table-column-header";
import { CollectionTableActions } from "./_components/collection-table-actions";

export type Collection = {
	id: number;
	name: string;
	description: string;
	photoCount: number;
};

export const columns: CollectionColumnDef<Collection>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" className="ml-2" />
		),
	},
	{
		accessorKey: "description",
		header: "Description",
	},
	{
		accessorKey: "photoCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Photos" />
		),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const collection = row.original;

			return <CollectionTableActions collection={collection} />;
		},
	},
];

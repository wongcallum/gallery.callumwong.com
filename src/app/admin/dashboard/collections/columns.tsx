"use client";

import type { ColumnDef as CollectionColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table-column-header";
import { CollectionTableActions } from "./_components/collection-table-actions";

export type Collection = {
	id: number;
	name: string;
	slug: string;
	description: string;
	photoCount: number;
	thumbnailPhotoURL: string | null;
};

export const columns: CollectionColumnDef<Collection>[] = [
	{
		id: "drag",
		header: "",
		size: 32,
	},
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

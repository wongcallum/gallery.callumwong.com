"use client";

import type { ColumnDef as TagColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table-column-header";
import { TagTableActions } from "./_components/tag-table-actions";

export type Tag = {
	id: number;
	name: string;
	photoCount: number;
};

export const columns: TagColumnDef<Tag>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" className="ml-2" />
		),
	},
	{
		accessorKey: "photoCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Images" />
		),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const tag = row.original;

			return <TagTableActions tag={tag} />;
		},
	},
];

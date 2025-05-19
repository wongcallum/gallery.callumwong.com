"use client";

import type { ColumnDef as TagColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "~/components/data-table-column-header";

import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type Tag = {
	tag: string;
	images: number;
};

export const columns: TagColumnDef<Tag>[] = [
	{
		accessorKey: "tag",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" className="ml-2" />
		),
	},
	{
		accessorKey: "images",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Images" />
		),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const collection = row.original;

			return (
				<div className="text-right">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Bulk rename</DropdownMenuItem>
							<DropdownMenuItem>Delete</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

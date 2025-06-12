import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Tag } from "../columns";
import { EditTagDialog } from "./create-edit-tag-dialog";
import { DeleteTagDialog } from "./delete-tag-dialog";

export function TagTableActions({ tag }: { tag: Tag }) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

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
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setDeleteOpen(true)}>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<EditTagDialog
				id={tag.id}
				name={tag.name}
				open={editOpen}
				setOpen={setEditOpen}
			/>
			<DeleteTagDialog
				id={tag.id}
				name={tag.name}
				open={deleteOpen}
				setOpen={setDeleteOpen}
			/>
		</div>
	);
}

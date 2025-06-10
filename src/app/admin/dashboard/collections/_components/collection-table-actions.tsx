import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Collection } from "../columns";
import { EditCollectionDialog } from "./edit-collection-dialog";

export function CollectionTableActions({
	collection,
}: { collection: Collection }) {
	const [editOpen, setEditOpen] = useState(false);

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
					<DropdownMenuItem>Modify images</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							setEditOpen(true);
						}}
					>
						Edit metadata
					</DropdownMenuItem>
					<DropdownMenuItem>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<EditCollectionDialog
				create={false}
				id={collection.id}
				name={collection.name}
				description={collection.description}
				open={editOpen}
				setOpen={setEditOpen}
			/>
		</div>
	);
}

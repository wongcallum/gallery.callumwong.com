import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

interface DeleteTagDialogProps {
	id: number;
	name: string;
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function DeleteTagDialog({
	id,
	name,
	open,
	setOpen,
}: DeleteTagDialogProps) {
	const utils = api.useUtils();
	const deleteMutation = api.tags.delete.useMutation();

	const onDelete = async () => {
		await deleteMutation.mutateAsync(id, {
			async onSuccess() {
				await utils.tags.invalidate();
				await utils.photos.searchPaginated.invalidate();
				setOpen(false);
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete tag</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete tag{" "}
						<b className="font-bold">{name}</b>?
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						type="submit"
						onClick={onDelete}
						disabled={deleteMutation.isPending}
					>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

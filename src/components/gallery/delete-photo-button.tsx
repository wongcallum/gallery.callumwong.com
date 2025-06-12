import { Trash } from "lucide-react";
import { useState } from "react";
import { IconButton, useLightboxState } from "yet-another-react-lightbox";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { DialogFooter, DialogHeader } from "~/components/ui/dialog";
import { api } from "~/trpc/react";

export function DeletePhotoButton() {
	const { currentSlide } = useLightboxState();
	const id = currentSlide?.src.split("/").at(-1);

	if (!id) return <IconButton label="Delete" icon={Trash} disabled />;

	const utils = api.useUtils();
	const mutation = api.photos.delete.useMutation();

	const [open, setOpen] = useState(false);

	const onDelete = async () => {
		mutation.mutateAsync(id, {
			async onSuccess() {
				await utils.collections.withPhotos.invalidate();
				await utils.collections.all.invalidate();
				setOpen(false);
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<IconButton label="Delete" icon={Trash} disabled={!currentSlide} />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete photo</DialogTitle>
				</DialogHeader>
				Are you sure you want to delete this photo?
				<DialogFooter>
					<Button
						type="submit"
						onClick={onDelete}
						disabled={mutation.isPending}
					>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

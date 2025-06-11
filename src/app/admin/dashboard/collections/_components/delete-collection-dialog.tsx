import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { api } from "~/trpc/react";

interface DeleteCollectionDialogProps {
	id: number;
	name: string;
	open: boolean;
	setOpen: (value: boolean) => void;
}

const formSchema = z.object({
	deletePhotos: z.boolean(),
});

// TODO: make this generic (or at least part of it)
export function DeleteCollectionDialog({
	id,
	name,
	open,
	setOpen,
}: DeleteCollectionDialogProps) {
	const utils = api.useUtils();
	const deleteMutation = api.collections.delete.useMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			deletePhotos: false,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		deleteMutation.mutateAsync(
			{
				id,
				deletePhotos: values.deletePhotos,
			},
			{
				async onSuccess() {
					await utils.collections.invalidate();
					setOpen(false);
					form.reset();
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete collection</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete collection {name}?
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<FormField
							control={form.control}
							name="deletePhotos"
							render={({ field }) => (
								<FormItem className="flex items-center">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormLabel>Delete photos in collection</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" disabled={deleteMutation.isPending}>
								Confirm
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

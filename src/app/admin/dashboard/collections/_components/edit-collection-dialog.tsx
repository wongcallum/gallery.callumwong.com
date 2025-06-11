import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
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
import { Input } from "~/components/ui/input";
import { createCollectionSchema } from "~/lib/schemas";
import { api } from "~/trpc/react";

interface EditCollectionDialogProps {
	create: boolean;
	id?: number;
	name?: string;
	description?: string;
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function EditCollectionDialog({
	create,
	id,
	name,
	description,
	open,
	setOpen,
}: EditCollectionDialogProps) {
	const utils = api.useUtils();
	const createMutation = api.collections.create.useMutation();
	const modifyMutation = api.collections.modify.useMutation();

	const form = useForm<z.infer<typeof createCollectionSchema>>({
		resolver: zodResolver(createCollectionSchema),
		values: {
			name: name || "",
			description: description || "",
		},
	});

	async function onSubmit(values: z.infer<typeof createCollectionSchema>) {
		if (create) {
			createMutation.mutateAsync(values, {
				async onSuccess() {
					await utils.collections.invalidate();
					setOpen(false);
					form.reset();
				},
			});

			return;
		}

		if (!id) return;
		modifyMutation.mutateAsync(
			{
				id,
				name: values.name,
				description: values.description,
			},
			{
				async onSuccess() {
					form.reset();
					setOpen(false);
					utils.collections.invalidate();
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{create ? "Create" : "Edit"} collection</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input className="col-span-3" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input className="col-span-3" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="submit"
								disabled={createMutation.isPending || modifyMutation.isPending}
							>
								Save changes
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

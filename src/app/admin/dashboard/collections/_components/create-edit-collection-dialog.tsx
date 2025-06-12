import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
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

type CollectionFormData = z.infer<typeof createCollectionSchema>;

interface CreateCollectionDialogProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function CreateCollectionDialog({
	open,
	setOpen,
}: CreateCollectionDialogProps) {
	const utils = api.useUtils();
	const createMutation = api.collections.create.useMutation();

	const form = useForm<CollectionFormData>({
		resolver: zodResolver(createCollectionSchema),
		defaultValues: {
			name: "",
			description: "",
			priority: 0,
		},
	});

	async function onSubmit(values: CollectionFormData) {
		createMutation.mutateAsync(values, {
			async onSuccess() {
				await utils.collections.invalidate();
				setOpen(false);
				form.reset();
			},
		});
	}

	return (
		<CollectionDialog
			open={open}
			setOpen={setOpen}
			title="Create collection"
			form={form}
			onSubmit={onSubmit}
			isPending={createMutation.isPending}
		/>
	);
}

interface EditCollectionDialogProps {
	id: number;
	name: string;
	description: string;
	priority: number;
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function EditCollectionDialog({
	id,
	name,
	description,
	priority,
	open,
	setOpen,
}: EditCollectionDialogProps) {
	const utils = api.useUtils();
	const modifyMutation = api.collections.modify.useMutation();

	const form = useForm<CollectionFormData>({
		resolver: zodResolver(createCollectionSchema),
		values: { name, description, priority },
	});

	async function onSubmit(values: CollectionFormData) {
		modifyMutation.mutateAsync(
			{
				id,
				name: values.name,
				description: values.description,
				priority: values.priority,
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
		<CollectionDialog
			open={open}
			setOpen={setOpen}
			title="Edit collection"
			form={form}
			onSubmit={onSubmit}
			isPending={modifyMutation.isPending}
		/>
	);
}

interface CollectionDialogProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	title: string;
	form: UseFormReturn<CollectionFormData>;
	onSubmit: (values: CollectionFormData) => Promise<void>;
	isPending: boolean;
}

function CollectionDialog({
	open,
	setOpen,
	title,
	form,
	onSubmit,
	isPending,
}: CollectionDialogProps) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
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
						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel>Priority</FormLabel>
									<FormControl>
										<Input type="number" className="col-span-3" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" disabled={isPending}>
								Save changes
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

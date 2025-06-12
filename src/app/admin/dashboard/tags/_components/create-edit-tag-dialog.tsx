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
import { createTagSchema } from "~/lib/schemas";
import { api } from "~/trpc/react";

type TagFormData = z.infer<typeof createTagSchema>;

interface CreateTagDialogProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function CreateTagDialog({ open, setOpen }: CreateTagDialogProps) {
	const utils = api.useUtils();
	const createMutation = api.tags.create.useMutation();

	const form = useForm<TagFormData>({
		resolver: zodResolver(createTagSchema),
		defaultValues: {
			name: "",
		},
	});

	async function onSubmit(values: TagFormData) {
		createMutation.mutateAsync(values, {
			async onSuccess() {
				await utils.tags.invalidate();
				setOpen(false);
				form.reset();
			},
		});
	}

	return (
		<TagDialog
			open={open}
			setOpen={setOpen}
			title="Define tag"
			form={form}
			onSubmit={onSubmit}
			isPending={createMutation.isPending}
		/>
	);
}

interface EditTagDialogProps {
	id: number;
	name: string;
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function EditTagDialog({ id, name, open, setOpen }: EditTagDialogProps) {
	const utils = api.useUtils();
	const modifyMutation = api.tags.modify.useMutation();

	const form = useForm<TagFormData>({
		resolver: zodResolver(createTagSchema),
		values: { name },
	});

	async function onSubmit(values: TagFormData) {
		modifyMutation.mutateAsync(
			{
				id,
				name: values.name,
			},
			{
				async onSuccess() {
					form.reset();
					setOpen(false);
					utils.tags.invalidate();
				},
			},
		);
	}

	return (
		<TagDialog
			open={open}
			setOpen={setOpen}
			title="Edit Tag"
			form={form}
			onSubmit={onSubmit}
			isPending={modifyMutation.isPending}
		/>
	);
}

interface TagDialogProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	title: string;
	form: UseFormReturn<TagFormData>;
	onSubmit: (values: TagFormData) => Promise<void>;
	isPending: boolean;
}

function TagDialog({
	open,
	setOpen,
	title,
	form,
	onSubmit,
	isPending,
}: TagDialogProps) {
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

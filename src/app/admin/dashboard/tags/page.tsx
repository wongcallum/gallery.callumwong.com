"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { columns } from "./columns";

export default function TagsPage() {
	const tags = api.tags.withCount.useQuery();
	const mutation = api.tags.create.useMutation();

	const [open, setOpen] = useState(false);

	const form = useForm<z.infer<typeof createTagSchema>>({
		resolver: zodResolver(createTagSchema),
		defaultValues: {
			name: "",
		},
	});

	async function onSubmit(values: z.infer<typeof createTagSchema>) {
		mutation.mutateAsync(values, {
			async onSuccess() {
				form.reset();
				setOpen(false);
				tags.refetch();
			},
		});
	}

	return (
		<DataTable
			filterPlaceholder="Filter tags..."
			filterColumn="name"
			columns={columns}
			data={tags.data || []}
		>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>Create tag</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Define tag</DialogTitle>
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
								<Button type="submit" disabled={mutation.isPending}>
									Save changes
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</DataTable>
	);
}

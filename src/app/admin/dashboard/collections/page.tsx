"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { createCollectionSchema } from "~/lib/schemas";
import { api } from "~/trpc/react";
import { columns } from "./columns";

export default function CollectionsPage() {
	const collections = api.collections.all.useQuery();
	const mutation = api.collections.create.useMutation();

	const [open, setOpen] = useState(false);

	const form = useForm<z.infer<typeof createCollectionSchema>>({
		resolver: zodResolver(createCollectionSchema),
		defaultValues: {
			name: "",
			description: "",
			location: "",
		},
	});

	async function onSubmit(values: z.infer<typeof createCollectionSchema>) {
		mutation.mutateAsync(values, {
			async onSuccess() {
				form.reset();
				setOpen(false);
				collections.refetch();
			},
		});
	}

	return (
		<DataTable
			filterPlaceholder="Filter collections..."
			filterColumn="name"
			columns={columns}
			data={collections.data || []}
		>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>New collection</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add collection</DialogTitle>
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
								name="location"
								render={({ field }) => (
									<FormItem className="grid grid-cols-4 items-center gap-4">
										<FormLabel>Location</FormLabel>
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

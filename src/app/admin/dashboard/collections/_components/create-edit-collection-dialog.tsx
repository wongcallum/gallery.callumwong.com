import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useState } from "react";
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
import { cn } from "~/lib/utils";
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
	thumbnailPhotoURL: string | null;
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function EditCollectionDialog({
	id,
	name,
	description,
	priority,
	thumbnailPhotoURL,
	open,
	setOpen,
}: EditCollectionDialogProps) {
	const utils = api.useUtils();
	const modifyMutation = api.collections.modify.useMutation();

	const form = useForm<CollectionFormData>({
		resolver: zodResolver(createCollectionSchema),
		values: { name, description, priority, thumbnailPhotoURL },
	});

	async function onSubmit(values: CollectionFormData) {
		modifyMutation.mutateAsync(
			{
				id,
				name: values.name,
				description: values.description,
				priority: values.priority,
				thumbnailPhotoURL: values.thumbnailPhotoURL,
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
			collectionId={id}
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
	collectionId?: number;
}

function CollectionDialog({
	open,
	setOpen,
	title,
	form,
	onSubmit,
	isPending,
	collectionId,
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
										<Input
											type="number"
											className="col-span-3"
											{...field}
											onChange={(e) => field.onChange(e.target.valueAsNumber)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{collectionId != null && (
							<FormField
								control={form.control}
								name="thumbnailPhotoURL"
								render={({ field }) => (
									<FormItem className="grid grid-cols-4 items-center gap-4">
										<FormLabel>Thumbnail</FormLabel>
										<div className="col-span-3">
											<ThumbnailPhotoPicker
												collectionId={collectionId}
												value={field.value ?? null}
												onChange={(url) => field.onChange(url)}
											/>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
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

function ThumbnailPhotoPicker({
	collectionId,
	value,
	onChange,
}: {
	collectionId: number;
	value: string | null;
	onChange: (url: string | null) => void;
}) {
	const [open, setOpen] = useState(false);
	const photosQuery = api.collections.photos.useQuery(collectionId, {
		enabled: open,
	});
	const photos = photosQuery.data ?? [];

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				className="flex-1 justify-start gap-2"
				onClick={() => setOpen(true)}
			>
				{value ? (
					<>
						{/* biome-ignore lint/performance/noImgElement: S3 images */}
						<img src={value} alt="" className="size-5 rounded object-cover" />
						<span className="truncate">Image</span>
					</>
				) : (
					<span className="text-muted-foreground">Show latest photo</span>
				)}
			</Button>
			{value && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-8 w-8 shrink-0"
					onClick={() => onChange(null)}
				>
					<X className="h-4 w-4" />
				</Button>
			)}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Select thumbnail</DialogTitle>
					</DialogHeader>
					{photosQuery.isLoading ? (
						<p className="py-8 text-center text-muted-foreground text-sm">
							Loading photos...
						</p>
					) : photos.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground text-sm">
							No photos in this collection
						</p>
					) : (
						<div className="grid max-h-96 grid-cols-4 gap-2 overflow-y-auto">
							{photos.map((photo) => (
								<button
									type="button"
									key={photo.id}
									className={cn(
										"relative aspect-square overflow-hidden rounded-md border-2",
										value === photo.thumbnailUrl
											? "border-primary"
											: "border-transparent hover:border-muted-foreground/40",
									)}
									onClick={() => {
										onChange(photo.thumbnailUrl);
										setOpen(false);
									}}
								>
									{/* biome-ignore lint/performance/noImgElement: S3 images */}
									<img
										src={photo.thumbnailUrl}
										alt=""
										className="h-full w-full object-cover"
									/>
									{value === photo.thumbnailUrl && (
										<div className="absolute top-1 right-1 rounded-full bg-primary p-0.5">
											<Check className="h-3 w-3 text-primary-foreground" />
										</div>
									)}
								</button>
							))}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

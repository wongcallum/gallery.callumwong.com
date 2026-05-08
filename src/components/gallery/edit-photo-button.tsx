import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IconButton, useLightboxState } from "yet-another-react-lightbox";
import type z from "zod";
import { CollectionSelect } from "~/components/collection-select";
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
import { editPhotoSchema } from "~/lib/schemas";
import { api } from "~/trpc/react";
import { TagSelect } from "../tag-select";

export function EditPhotoButton() {
	const { currentSlide } = useLightboxState();
	const id = currentSlide?.src.split("/").at(-1);

	const formSchema = editPhotoSchema.omit({ id: true });

	const utils = api.useUtils();
	const existingPhoto = api.photos.withTags.useQuery(id ?? "", {
		enabled: !!id,
	});
	const mutation = api.photos.edit.useMutation({
		async onSuccess() {
			await utils.collections.withPhotos.invalidate();
			await utils.collections.all.invalidate();
			await existingPhoto.refetch();
		},
	});

	const [open, setOpen] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			collection: "",
			tags: [],
		},
		values: {
			collection: existingPhoto?.data?.collectionId?.toString() || "",
			tags: existingPhoto.data?.photosToTags.map((val) => val.tagId) || [],
		},
	});

	if (!id) return <IconButton label="Edit" icon={Pencil} disabled />;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const newValues = Object.assign(values, { id });
		mutation.mutateAsync(newValues, {
			async onSuccess() {
				setOpen(false);
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<IconButton label="Edit" icon={Pencil} disabled={!currentSlide} />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit photo</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<FormField
							control={form.control}
							name="collection"
							render={({ field }) => (
								<FormItem className="flex items-center">
									<FormLabel>Collection:</FormLabel>
									<CollectionSelect
										value={field.value || undefined}
										onChange={(val) => form.setValue("collection", val ?? "")}
										placeholder="None"
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="tags"
							render={({ field }) => (
								<FormItem className="flex items-center">
									<FormLabel>Tags:</FormLabel>
									<FormControl>
										<TagSelect
											ref={field.ref}
											onChange={(val) =>
												field.onChange(val.map((c) => c.value))
											}
										/>
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
	);
}

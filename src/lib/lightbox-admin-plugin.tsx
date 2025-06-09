import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	IconButton,
	type PluginProps,
	addToolbarButton,
	useLightboxState,
} from "yet-another-react-lightbox";
import type z from "zod";
import { Combobox } from "~/components/combobox";
import ReactSelect from "~/components/react-select";
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
import { api } from "~/trpc/react";
import { editPhotoSchema } from "./schemas";

declare module "yet-another-react-lightbox" {
	interface Labels {
		Delete?: string;
		Edit?: string;
	}
}

function DeleteButton() {
	const { currentSlide } = useLightboxState();
	const id = currentSlide?.src.split("/").at(-1);

	if (!id) return <IconButton label="Delete" icon={Trash} disabled />;

	const utils = api.useUtils();
	const mutation = api.photos.delete.useMutation({
		onSuccess(input) {
			utils.photos.search.invalidate();
		},
	});

	return (
		<IconButton
			label="Delete"
			icon={Trash}
			disabled={!currentSlide}
			onClick={() => {
				mutation.mutate(id);
			}}
		/>
	);
}

function EditButton() {
	const { currentSlide } = useLightboxState();
	const id = currentSlide?.src.split("/").at(-1);

	if (!id) return <IconButton label="Edit" icon={Pencil} disabled />;

	const formSchema = editPhotoSchema.omit({ id: true });

	const utils = api.useUtils();
	const existingPhoto = api.photos.withTags.useQuery(id);
	const collections = api.collections.all.useQuery();
	const tags = api.tags.all.useQuery();

	const options =
		tags.data?.map((tag) => ({
			value: tag.id,
			label: tag.name,
		})) || [];

	const mutation = api.photos.edit.useMutation({
		onSuccess(input) {
			utils.photos.search.invalidate();
			existingPhoto.refetch();
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
					<FormField
						control={form.control}
						name="collection"
						render={({ field }) => (
							<FormItem className="flex items-center">
								<FormLabel>Add to collection:</FormLabel>
								<Combobox
									id="collection"
									options={
										collections.data?.map((collection) => ({
											value: collection.id.toString(),
											label: collection.name,
										})) || []
									}
									placeholder="None"
									value={field.value}
									setValue={(value) => form.setValue("collection", value)}
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
								<FormLabel>Apply tags:</FormLabel>
								<FormControl>
									<ReactSelect
										isMulti={true}
										options={options}
										ref={field.ref}
										value={options.filter((c) => field.value.includes(c.value))}
										onChange={(val) => field.onChange(val.map((c) => c.value))}
										className="w-full"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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

export function AdminPlugin({ augment }: PluginProps) {
	augment(({ toolbar, ...restProps }) => {
		return {
			toolbar: addToolbarButton(
				addToolbarButton(toolbar, "edit", <EditButton />),
				"delete",
				<DeleteButton />,
			),
			...restProps,
		};
	});
}

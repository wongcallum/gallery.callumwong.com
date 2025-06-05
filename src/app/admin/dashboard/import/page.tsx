"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import type { z } from "zod";
import { Combobox } from "~/components/combobox";
import { MultiAsyncSelect } from "~/components/multi-async-select";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { importPhotoSchema } from "~/lib/schemas";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

type FileWithPreview = File & {
	preview: string;
};

export default function ImportPage() {
	const mutation = api.photos.create.useMutation();
	const collections = api.collections.all.useQuery();

	const tagSearch = api.tags.search.useMutation();
	useEffect(tagSearch.mutate, []);
	const handleSearch = useDebouncedCallback((value: string) => {
		// if (!value) {
		// 	tagSearch.reset();
		// } else {
		tagSearch.mutate({ searchString: value });
		// }
	}, 500);

	const form = useForm<z.infer<typeof importPhotoSchema>>({
		resolver: zodResolver(importPhotoSchema),
		defaultValues: {
			exif: true,
			collection: "",
			tags: [],
		},
	});

	const [images, setImages] = useState<FileWithPreview[]>([]);
	const removeImage = (file: FileWithPreview) => {
		setImages((prevImages) => prevImages.filter((img) => img !== file));
		URL.revokeObjectURL(file.preview);
	};

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			for (const file of acceptedFiles) {
				images.push(
					Object.assign(file, {
						preview: URL.createObjectURL(file),
					}),
				);
			}
		},
		[images],
	);

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragReject,
		fileRejections,
	} = useDropzone({
		onDrop,
		maxFiles: 10,
		maxSize: 25 * 1024 * 1024,
		accept: {
			"image/*": [],
		},
		multiple: true,
	});

	async function onSubmit(data: z.infer<typeof importPhotoSchema>) {
		for (const image of images) {
			const fd = new FormData();

			fd.append("collection", data.collection);
			fd.append("tags", JSON.stringify(data.tags));
			fd.append("exif", data.exif.toString());
			fd.append("image", image);

			await mutation.mutateAsync(fd, {
				onSuccess() {
					removeImage(image);
					form.reset();
				},
			});
		}
	}

	useEffect(() => {
		if (fileRejections.length > 0) {
			const errorType = fileRejections[0]?.errors[0]?.code;
			if (errorType === "file-invalid-type") {
				console.log("Please upload a file with the correct format");
			} else if (errorType === "file-too-large") {
				console.log("Please upload a file with the correct size");
			} else {
				console.log("There was a problem with your request. Please try again");
			}
		}
	}, [fileRejections]);

	return (
		<div className="py-4">
			<div
				className={cn(
					"relative flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10",
					{
						"border-green-500 bg-green-500/10": isDragActive && !isDragReject,
						"border-destructive bg-destructive/10":
							isDragActive && isDragReject,
						"border-border bg-card": !isDragActive,
					},
				)}
				{...getRootProps()}
			>
				<input {...getInputProps()} id="images" />
				<ImageUpIcon className="h-12 w-12 fill-primary/75" />
				<div className="mt-4 mb-2">Drag & drop here or click to select</div>
				<span
					className={cn("-translate-x-1/2 absolute bottom-2 left-1/2 text-xs", {
						"text-destructive": isDragReject || fileRejections.length > 0,
						"text-muted-foreground":
							!isDragReject && !(fileRejections.length > 0),
					})}
				>
					Max size: 25MiB
				</span>
			</div>
			<div className="mt-2 grid grid-cols-2 gap-4 py-4 md:grid-cols-4 xl:grid-cols-6">
				{images.map((file, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						className="flex flex-col items-center text-center"
					>
						<img src={file.preview} alt={file.name} className="rounded-md" />
						<p className="my-1 text-sm">{file.name}</p>
						<p className="mb-1 text-muted-foreground text-xs">
							{(file.size / 1024).toFixed(1)} kB
						</p>
						<Button
							variant="destructive"
							onClick={() => removeImage(file)}
							size="sm"
							disabled={mutation.isPending}
						>
							Remove
						</Button>
					</div>
				))}
			</div>

			{/* end dropzone */}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-4 flex flex-col gap-2 text-nowrap"
				>
					<FormField
						control={form.control}
						name="exif"
						render={({ field }) => (
							<FormItem className="flex items-center">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormLabel>Import EXIF data</FormLabel>
								<FormMessage />
							</FormItem>
						)}
					/>
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
									<MultiAsyncSelect
										loading={tagSearch.isPending}
										// error={searchMutation.error}
										options={
											tagSearch.data?.map((tag) => ({
												value: tag.id.toString(),
												label: tag.name,
											})) || []
										}
										onValueChange={field.onChange}
										className="w-fit"
										onSearch={handleSearch}
										async
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={images.length === 0}>
						Import
					</Button>
				</form>
			</Form>
		</div>
	);
}

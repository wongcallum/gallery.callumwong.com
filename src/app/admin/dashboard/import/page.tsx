"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Combobox } from "~/components/combobox";
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
import { Input } from "~/components/ui/input";
import { importPhotoSchema } from "~/lib/schemas";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

type FileWithPreview = File & {
	preview: string;
};

export default function ImportPage() {
	const mutation = api.photos.create.useMutation();

	const form = useForm<z.infer<typeof importPhotoSchema>>({
		resolver: zodResolver(importPhotoSchema),
		defaultValues: {
			exif: false,
			collection: "",
			tags: "",
		},
	});

	const [images, setImages] = useState<FileWithPreview[]>([]);

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
		open,
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
		for (const img of images) {
			const fd = new FormData();

			if (data.collection) fd.append("collection", data.collection);
			if (data.tags) fd.append("tags", data.tags);
			fd.append("exif", data.exif.toString());
			fd.append("image", img);

			mutation.mutate(fd);
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
				<div className="mt-4 mb-2">
					Drop or{" "}
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
					<span
						onClick={() => open()}
						className="cursor-pointer text-primary hover:underline"
					>
						select
					</span>
				</div>
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
			<div className="mt-2 grid grid-cols-5 gap-2">
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
							onClick={() => {
								URL.revokeObjectURL(file.preview);
								setImages(images.filter((img) => file !== img));
							}}
							size="sm"
							className="w-full"
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
									options={[
										{
											value: "1",
											label: "My Portfolio",
										},
									]}
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
									<Input
										placeholder="Add tags separated by spaces"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Import</Button>
				</form>
			</Form>
		</div>
	);
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Checkbox } from "~/components/ui/checkbox";
import { Combobox } from "~/components/combobox";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";

type PreviewFile = File & {
	preview: string;
};

const formSchema = z.object({
	files: z.array(z.any()),
	exif: z.boolean().optional(),
	collection: z.string().optional(),
	tags: z.string().optional(),
});

export default function ImportPage() {
	const [files, setFiles] = useState<PreviewFile[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			files: [],
			exif: false,
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const mappedFiles: PreviewFile[] = acceptedFiles.map((file) =>
			Object.assign(file, {
				preview: URL.createObjectURL(file),
			}),
		);
		setFiles((prev) => [...prev, ...mappedFiles]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [],
		},
		multiple: true,
	});

	const removeFile = (file: PreviewFile) => {
		setFiles((prev) => prev.filter((f) => f !== file));
		URL.revokeObjectURL(file.preview); // Free memory
	};

	useEffect(() => {
		return () => {
			for (const file of files) {
				URL.revokeObjectURL(file.preview);
			}
		};
	}, [files]);

	return (
		<div className="py-4">
			<div
				{...getRootProps()}
				className="dashed cursor-pointer rounded-md border-2 p-16 text-center"
			>
				<input {...getInputProps()} />
				{isDragActive ? (
					<p>Drop the images here ...</p>
				) : (
					<p>Drag & drop here, or click to select files</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4 py-4 md:grid-cols-4 xl:grid-cols-8">
				{files.map((file, index) => (
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
							onClick={() => removeFile(file)}
							size="sm"
						>
							Delete
						</Button>
					</div>
				))}
			</div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-4 flex flex-col gap-2 text-nowrap"
				>
					<FormField
						control={form.control}
						name="exif"
						render={({ field }) => (
							<FormItem className="flex">
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
							<FormItem className="flex">
								<FormLabel>Language</FormLabel>
								<Combobox
									id="Add to collection:"
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
							<FormItem className="flex">
								<FormLabel>Apply tags:</FormLabel>
								<FormControl>
									<Input
										placeholder="Add tags separated by commas"
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

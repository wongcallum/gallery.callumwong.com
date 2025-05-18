"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Combobox } from "~/components/combobox";
import { TagInput } from "~/components/tag-input";

type PreviewFile = File & {
	preview: string;
};

export default function ImportPage() {
	const [collection, setCollection] = useState<string>();

	const [files, setFiles] = useState<PreviewFile[]>([]);

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

			<div className="mt-4 flex flex-col gap-2">
				<div className="flex items-center space-x-2">
					<Checkbox id="exif" />
					<Label htmlFor="exif">Import EXIF data</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Label htmlFor="exif">Add all to collection:</Label>
					<Combobox
						id="exif"
						options={[
							{
								value: "1",
								label: "My Portfolio",
							},
						]}
						placeholder="None"
						value={collection}
						setValue={setCollection}
					/>
				</div>
				<div className="flex items-center space-x-2">
					<Label htmlFor="exif">Apply tags to all:</Label>
				</div>
				<Button className="w-fit">Import</Button>
			</div>
		</div>
	);
}

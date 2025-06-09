"use client";

import { Aperture, Film, Timer } from "lucide-react";
import React from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import { Lightbox } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import ReactSelect from "~/components/react-select";
import { apertureString, shutterSpeedString } from "~/lib/utils";
import { api } from "~/trpc/react";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "react-photo-album/rows.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";

const formSchema = z.object({
	search: z.array(z.coerce.number()),
});

const paramSchema = z.object({
	search: z.string().transform((val) => val.split(",").map(Number)),
});

export default function Tags() {
	const router = useRouter();

	const searchParams = useSearchParams();

	const params = searchParams.has("search")
		? paramSchema.parse({
				search: searchParams.get("search"),
			})
		: { search: [] };

	const tags = api.tags.all.useQuery();
	const searchPhotos = api.photos.search.useQuery(params);

	const options =
		tags.data?.map((tag) => ({
			value: tag.id,
			label: tag.name,
		})) || [];

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: params,
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		router.push(`?search=${values.search}`);
	}

	const [index, setIndex] = React.useState(-1);

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
					<FormField
						control={form.control}
						name="search"
						render={({ field }) => (
							<FormItem className="grow">
								<FormControl>
									<ReactSelect
										isMulti={true}
										options={options}
										ref={field.ref}
										value={options.filter((c) => field.value.includes(c.value))}
										onChange={(val) => field.onChange(val.map((c) => c.value))}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<Button type="submit">Search</Button>
				</form>
			</Form>

			<RowsPhotoAlbum
				photos={
					searchPhotos.data?.map((photo) => ({
						src: photo.thumbnailUrl,
						width: photo.thumbnailWidth,
						height: photo.thumbnailHeight,
						key: photo.id,
						alt: photo.title || photo.id,
						title: photo.title || "",
					})) || []
				}
				targetRowHeight={150}
				onClick={({ index }) => setIndex(index)}
				render={{
					container: ({ ref, ...rest }) => (
						<div ref={ref} {...rest} className={`${rest.className} py-4`} />
					),
					// biome-ignore lint/a11y/useAltText: <explanation>
					image: (props) => (
						<img {...props} className={`${props.className} rounded-md`} />
					),
				}}
			/>
			<Lightbox
				index={index}
				slides={searchPhotos.data?.map((photo) => ({
					src: photo.url,
					title: photo.title,
					description: (
						<div className="flex justify-center gap-12 md:gap-24">
							<div className="flex flex-row items-center gap-1">
								<Film />
								<span>{photo.isoSpeed}</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<Timer />
								<span>{shutterSpeedString(photo.shutterSpeed)}</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<Aperture />
								<span>{apertureString(photo.aperture)}</span>
							</div>
						</div>
					),
				}))}
				open={index >= 0}
				close={() => setIndex(-1)}
				plugins={[Captions]}
				captions={{
					showToggle: true,
				}}
				styles={{
					captionsTitleContainer: {
						display: "flex",
						justifyContent: "center",
					},
				}}
				render={{
					slide: ({ slide }) => {
						return (
							<img
								src={slide.src}
								alt={slide.alt}
								className="max-h-full xl:max-h-9/10"
							/>
						);
					},
				}}
			/>
		</>
	);
}

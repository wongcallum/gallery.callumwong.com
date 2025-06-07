"use client";
import React, { useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { RowsPhotoAlbum } from "react-photo-album";
import type { MultiValue } from "react-select";
import { useDebouncedCallback } from "use-debounce";
import { Lightbox } from "yet-another-react-lightbox";
import { Combobox } from "~/components/combobox";
import { DatePickerWithRange } from "~/components/date-range-picker";
import ReactSelect, { type OptionType } from "~/components/react-select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";

import "yet-another-react-lightbox/styles.css";
import "react-photo-album/rows.css";

export default function Home() {
	const cameras = api.filter.cameras.useQuery();
	const lenses = api.filter.lens.useQuery();
	const collections = api.collections.all.useQuery();
	const tags = api.tags.all.useQuery();

	const searchPhotos = api.photos.search.useMutation();

	useEffect(() => searchPhotos.mutate([]), []);

	const options =
		tags.data?.map((tag) => ({
			value: tag.id,
			label: tag.name,
		})) || [];

	const [camera, setCamera] = React.useState<string>();
	const [lens, setLens] = React.useState<string>();
	const [date, setDate] = React.useState<DateRange | undefined>();

	const [index, setIndex] = React.useState(-1);

	const searchDebounced = useDebouncedCallback(
		async (values: MultiValue<OptionType>) => {
			await searchPhotos.mutateAsync(values.map((val) => val.value as number));
		},
		1000,
	);

	return (
		<Tabs
			defaultValue="collection"
			className="flex min-h-screen w-full flex-row"
		>
			<div className="flex flex-col gap-2 px-3 py-2 pb-12">
				<Label className="mt-2">Browse by</Label>
				<TabsList>
					<TabsTrigger value="collection">Collections</TabsTrigger>
					<TabsTrigger value="tag">Tags</TabsTrigger>
				</TabsList>
				<Label className="mt-2">Filter</Label>
				<Combobox
					value={camera}
					setValue={setCamera}
					placeholder="All cameras"
					options={
						cameras.data?.map((camera) => {
							return { value: camera.id.toString(), label: camera.name };
						}) || []
					}
				/>
				<Combobox
					value={lens}
					setValue={setLens}
					placeholder="All lenses"
					options={
						lenses.data?.map((lens) => {
							return { value: lens.id.toString(), label: lens.name };
						}) || []
					}
				/>
				<DatePickerWithRange date={date} setDate={setDate} />
			</div>
			<div className="w-full border-l p-4">
				<TabsContent value="collection">
					<Input />
					<div className="columns-2 gap-4 py-4 sm:columns-3 sm:gap-8">
						{collections.data?.map((collection) => (
							<div className="relative aspect-3/2" key={collection.id}>
								<img
									className="h-full w-full rounded-md object-cover"
									src={collection.thumbnailPhotoURL || "/frown.svg"}
									alt={`Thumbnail for ${collection.name}`}
								/>
								<div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-md bg-black/60 p-2 text-white">
									<span className="font-semibold">{collection.name}</span>
									<span>{collection.photoCount}</span>
								</div>
							</div>
						))}
					</div>
				</TabsContent>
				<TabsContent value="tag">
					<ReactSelect
						isMulti={true}
						options={options}
						onChange={(val) => searchDebounced(val)}
					/>
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
						}))}
						open={index >= 0}
						close={() => setIndex(-1)}
					/>
				</TabsContent>
			</div>
		</Tabs>
	);
}

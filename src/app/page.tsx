"use client";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Combobox } from "~/components/combobox";
import { DatePickerWithRange } from "~/components/date-range-picker";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";

export default function Home() {
	const cameras = api.filter.cameras.useQuery();
	const lenses = api.filter.lens.useQuery();
	const collections = api.collections.all.useQuery();

	const [camera, setCamera] = React.useState<string>();
	const [lens, setLens] = React.useState<string>();
	const [date, setDate] = React.useState<DateRange | undefined>();

	return (
		<Tabs defaultValue="collection" className="flex min-h-screen flex-row">
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
			<div className="border-l p-4">
				<TabsContent value="collection">
					<Input />
					<div className="columns-2 gap-4 py-4 sm:columns-3 sm:gap-8">
						{collections.data?.map((collection) => {
							return (
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
							);
						})}
					</div>
				</TabsContent>
				<TabsContent value="tag">
					{/* TODO: tag input (probably react-tag-autocomplete) */}
					<Input />
					<div className="columns-2 gap-4 space-y-4 py-4 sm:columns-3 sm:gap-8 sm:space-y-8 lg:columns-6">
						{/* biome-ignore lint/a11y/useAltText: <explanation> */}
						<img className="rounded-md" src="/IMG_0664.jpg" />
						{/* biome-ignore lint/a11y/useAltText: <explanation> */}
						<img className="rounded-md" src="/IMG_0592.jpg" />
					</div>
				</TabsContent>
			</div>
		</Tabs>
	);
}

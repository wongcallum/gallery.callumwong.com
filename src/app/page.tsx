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
	const cameras = api.post.cameras.useQuery();
	const lenses = api.post.lens.useQuery();

	const [camera, setCamera] = React.useState<string>();
	const [lens, setLens] = React.useState<string>();
	const [date, setDate] = React.useState<DateRange | undefined>();

	if (!cameras.data || !lenses.data) return <div>Loading...</div>;

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
					options={cameras.data.map((camera) => {
						return { value: camera.serial, label: camera.model };
					})}
				/>
				<Combobox
					value={lens}
					setValue={setLens}
					placeholder="All lenses"
					options={lenses.data.map((lens) => {
						return { value: lens.serial, label: lens.model };
					})}
				/>
				<DatePickerWithRange date={date} setDate={setDate} />
			</div>
			<div className="border-l p-4">
				<TabsContent value="collection">
					<Input />
					<div className="columns-2 gap-4 py-4 sm:columns-3 sm:gap-8">
						<div className="relative aspect-3/2">
							<img
								className="h-full w-full rounded-md object-cover"
								src="/IMG_0664.jpg"
							/>
							<div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-md bg-black/60 p-2 text-white">
								<span className="font-semibold">My Portfolio</span>
								<span className="text-muted">50 images</span>
							</div>
						</div>
						<div className="relative aspect-3/2">
							<img
								className="h-full w-full rounded-md object-cover"
								src="/IMG_0592.jpg"
							/>
							<div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-md bg-black/60 p-2 text-white">
								<span className="font-semibold">Fat</span>
								<span className="text-muted">999 images</span>
							</div>
						</div>
					</div>
				</TabsContent>
			</div>
		</Tabs>
	);
}

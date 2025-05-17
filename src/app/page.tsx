"use client";

import React from "react";
import type { DateRange } from "react-day-picker";
import { ComboBox } from "~/components/combobox";
import { DatePickerWithRange } from "~/components/date-range-picker";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "~/components/ui/tabs";
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
				<TabsList className="block">
					<TabsTrigger value="collection">Collections</TabsTrigger>
					<TabsTrigger value="tag">Tags</TabsTrigger>
				</TabsList>
				<Label className="mt-2">Filter</Label>
				<ComboBox
					value={camera}
					setValue={setCamera}
					placeholder="All cameras"
					options={cameras.data.map((camera) => {
						return { value: camera.serial, label: camera.model };
					})}
				/>
				<ComboBox
					value={lens}
					setValue={setLens}
					placeholder="All lenses"
					options={lenses.data.map((lens) => {
						return { value: lens.serial, label: lens.model };
					})}
				/>
				<DatePickerWithRange date={date} setDate={setDate} />
			</div>
			<div className="flex-grow border-l p-4">
				<TabsContent value="collection">
					<Input />
				</TabsContent>
			</div>
		</Tabs>
	);
}

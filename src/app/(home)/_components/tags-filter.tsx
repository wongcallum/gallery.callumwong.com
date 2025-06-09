import React from "react";
import type { DateRange } from "react-day-picker";
import { Combobox } from "~/components/combobox";
import { DatePickerWithRange } from "~/components/date-range-picker";
import { SidebarGroup, SidebarGroupLabel } from "~/components/ui/sidebar";
import { api } from "~/trpc/react";

export default function TagsFilter() {
	const cameras = api.filter.cameras.useQuery();
	const lenses = api.filter.lens.useQuery();

	const [camera, setCamera] = React.useState<string>();
	const [lens, setLens] = React.useState<string>();
	const [date, setDate] = React.useState<DateRange | undefined>();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Filter</SidebarGroupLabel>
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
		</SidebarGroup>
	);
}

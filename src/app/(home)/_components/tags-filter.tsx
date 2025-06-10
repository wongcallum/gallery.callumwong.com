import type { DateRange } from "react-day-picker";
import { Combobox } from "~/components/combobox";
import { DatePickerWithRange } from "~/components/date-range-picker";
import { SidebarGroup, SidebarGroupLabel } from "~/components/ui/sidebar";
import { api } from "~/trpc/react";

interface TagsFilterProps {
	camera: string;
	setCamera: (value: string) => void;
	lens: string;
	setLens: (value: string) => void;
	date: DateRange | undefined;
	setDate: (value: DateRange | undefined) => void;
}

export default function TagsFilter({
	camera,
	setCamera,
	lens,
	setLens,
	date,
	setDate,
}: TagsFilterProps) {
	const cameras = api.filter.cameras.useQuery();
	const lenses = api.filter.lens.useQuery();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Filter</SidebarGroupLabel>
			<div className="flex flex-col gap-2">
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
		</SidebarGroup>
	);
}

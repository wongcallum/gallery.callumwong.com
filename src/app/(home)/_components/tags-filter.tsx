import type { DateRange } from "react-day-picker";
import { Combobox } from "~/components/combobox";
import { DatePickerWithRange } from "~/components/date-range-picker";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { SidebarGroup, SidebarGroupLabel } from "~/components/ui/sidebar";
import { api } from "~/trpc/react";

interface TagsFilterProps {
	collectionsMode: boolean;
	setCollectionsMode: (value: boolean) => void;
	camera: string | undefined;
	setCamera: (value: string | undefined) => void;
	lens: string | undefined;
	setLens: (value: string | undefined) => void;
	date: DateRange | undefined;
	setDate: (value: DateRange | undefined) => void;
	onClearAll?: () => void;
}

export default function TagsFilter({
	collectionsMode,
	setCollectionsMode,
	camera,
	setCamera,
	lens,
	setLens,
	date,
	setDate,
	onClearAll,
}: TagsFilterProps) {
	const camerasQuery = api.filter.cameras.useQuery();
	const lensesQuery = api.filter.lens.useQuery();

	return (
		<>
			<SidebarGroup>
				<div className="flex items-center gap-2 px-2 py-1">
					<Checkbox
						id="collections-mode"
						checked={collectionsMode}
						onCheckedChange={(checked) => setCollectionsMode(checked === true)}
					/>
					<Label htmlFor="collections-mode" className="cursor-pointer text-sm">
						Browse by collection
					</Label>
				</div>
			</SidebarGroup>
			<SidebarGroup>
				<SidebarGroupLabel>Filter</SidebarGroupLabel>
				<div className="flex flex-col gap-2">
					<Combobox
						value={camera?.toString()}
						setValue={setCamera}
						placeholder="All cameras"
						options={
							camerasQuery.data?.map((camera) => ({
								value: camera.id.toString(),
								label: camera.name,
							})) || []
						}
					/>
					<Combobox
						value={lens?.toString()}
						setValue={setLens}
						placeholder="All lenses"
						options={
							lensesQuery.data?.map((lens) => ({
								value: lens.id.toString(),
								label: lens.name,
							})) || []
						}
					/>
					<DatePickerWithRange date={date} setDate={setDate} />
					{onClearAll && (
						<Button variant="ghost" size="sm" onClick={onClearAll}>
							Clear all
						</Button>
					)}
				</div>
			</SidebarGroup>
		</>
	);
}

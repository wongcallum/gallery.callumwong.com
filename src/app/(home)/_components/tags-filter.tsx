import type { DateRange } from "react-day-picker";
import { Combobox } from "~/components/combobox";
import { DatePickerWithRange } from "~/components/date-range-picker";
import { Badge } from "~/components/ui/badge";
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
	onTagClick?: (tagId: number) => void;
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
	onTagClick,
	onClearAll,
}: TagsFilterProps) {
	const camerasQuery = api.filter.cameras.useQuery();
	const lensesQuery = api.filter.lens.useQuery();
	const tagsWithCount = api.tags.withCount.useQuery();

	const popularTags = tagsWithCount.data
		?.filter((t) => t.photoCount > 0)
		.sort((a, b) => b.photoCount - a.photoCount)
		.slice(0, 15);

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
			{popularTags && popularTags.length > 0 && (
				<SidebarGroup>
					<SidebarGroupLabel>Popular Tags</SidebarGroupLabel>
					<div className="flex flex-wrap gap-1.5 px-2">
						{popularTags.map((tag) => (
							<Badge
								key={tag.id}
								variant="secondary"
								className="cursor-pointer hover:bg-secondary/80"
								onClick={() => onTagClick?.(tag.id)}
							>
								{tag.name}
								<span className="ml-1 text-muted-foreground">
									{tag.photoCount}
								</span>
							</Badge>
						))}
					</div>
				</SidebarGroup>
			)}
		</>
	);
}

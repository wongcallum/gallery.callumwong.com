import type { Ref } from "react";
import type {
	ActionMeta,
	GroupBase,
	MultiValue,
	SelectInstance,
} from "react-select";
import { useDebouncedCallback } from "use-debounce";
import { api } from "~/trpc/react";
import { AsyncSelectComponent, type OptionType } from "./react-select";

interface TagSelectProps {
	value?: number[];
	onChange: (
		newValue: MultiValue<OptionType>,
		actionMeta: ActionMeta<OptionType>,
	) => void;
	ref?: Ref<SelectInstance<OptionType, true, GroupBase<OptionType>>>;
}

export function TagSelect({ value, onChange, ref }: TagSelectProps) {
	const allTags = api.tags.all.useQuery();
	const tagsSearchMutation = api.tags.search.useMutation();

	const selectedTags =
		value && allTags.data
			? (value.map((tagId) => {
					const tag = allTags.data.find((t) => t.id === tagId);
					return tag ? { value: tag.id, label: tag.name } : null;
				}) as OptionType[])
			: [];

	const handleSearch = useDebouncedCallback(
		(value: string, callback: (options: OptionType[]) => void) => {
			tagsSearchMutation.mutateAsync(
				{
					searchString: value,
				},
				{
					onSuccess(data) {
						callback(
							data.map((tag) => ({
								value: tag.id,
								label: tag.name,
							})),
						);
					},
				},
			);
		},
		500,
	);

	return (
		<AsyncSelectComponent
			isMulti={true}
			cacheOptions
			defaultOptions
			loadOptions={handleSearch}
			value={selectedTags}
			ref={ref}
			onChange={onChange}
		/>
	);
}

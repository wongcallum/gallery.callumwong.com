import type { Ref } from "react";
import type { DateRange } from "react-day-picker";
import type {
	ActionMeta,
	GroupBase,
	MultiValue,
	SelectInstance,
} from "react-select";
import { useDebouncedCallback } from "use-debounce";
import { api } from "~/trpc/react";
import { AsyncSelectComponent, type OptionType } from "./react-select";

interface Filter {
	camera?: number;
	lens?: number;
	date?: DateRange;
}

interface TagSelectProps {
	onChange: (
		newValue: MultiValue<OptionType>,
		actionMeta: ActionMeta<OptionType>,
	) => void;
	ref?: Ref<SelectInstance<OptionType, true, GroupBase<OptionType>>>;
}

export function TagSelect({ onChange, ref }: TagSelectProps) {
	const tagsSearchMutation = api.tags.search.useMutation();
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
			ref={ref}
			onChange={onChange}
		/>
	);
}

"use client";

import { Combobox } from "~/components/combobox";
import { api } from "~/trpc/react";

interface CollectionSelectProps {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	placeholder?: string;
}

export function CollectionSelect({
	value,
	onChange,
	placeholder = "All collections",
}: CollectionSelectProps) {
	const collections = api.collections.all.useQuery();

	return (
		<Combobox
			value={value}
			setValue={(val) => onChange(val || undefined)}
			placeholder={placeholder}
			options={
				collections.data?.map((c) => ({
					value: c.id.toString(),
					label: c.name,
				})) || []
			}
		/>
	);
}

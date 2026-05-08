"use client";

import { Combobox } from "~/components/combobox";
import { api } from "~/trpc/react";

interface CollectionSelectProps {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
}

export function CollectionSelect({ value, onChange }: CollectionSelectProps) {
	const collections = api.collections.all.useQuery();

	return (
		<Combobox
			value={value}
			setValue={(val) => onChange(val || undefined)}
			placeholder="All collections"
			options={
				collections.data?.map((c) => ({
					value: c.id.toString(),
					label: c.name,
				})) || []
			}
		/>
	);
}

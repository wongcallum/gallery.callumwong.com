"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export default function Collections() {
	const collections = api.collections.all.useQuery();

	const [search, setSearch] = useState("");

	return (
		<>
			<Input onChange={(val) => setSearch(val.target.value)} />
			<div className="grid grid-flow-row grid-cols-2 gap-4 py-4 lg:grid-cols-3 2xl:grid-cols-4">
				{collections.data
					?.filter((c) => c.name.includes(search))
					.map((collection) => (
						<div className="relative aspect-3/2" key={collection.id}>
							<Link href={`/collections/${collection.id}`}>
								<img
									className="h-full w-full rounded-md object-cover"
									src={collection.thumbnailPhotoURL || "/frown.svg"}
									alt={`Thumbnail for ${collection.name}`}
								/>
							</Link>
							<div className="absolute right-0 bottom-0 left-0 flex items-end justify-between rounded-b-md bg-black/60 p-2 text-white">
								<span className="pr-2 font-semibold">{collection.name}</span>
								<span title={`${collection.photoCount} photos`}>
									{collection.photoCount}
								</span>
							</div>
						</div>
					))}
			</div>
		</>
	);
}

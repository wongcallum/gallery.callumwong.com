"use client";

import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export default function Collections() {
	const collections = api.collections.all.useQuery();

	return (
		<>
			<Input />
			<div className="columns-2 gap-4 py-4 sm:columns-3 sm:gap-8">
				{collections.data?.map((collection) => (
					<div className="relative aspect-3/2" key={collection.id}>
						<img
							className="h-full w-full rounded-md object-cover"
							src={collection.thumbnailPhotoURL || "/frown.svg"}
							alt={`Thumbnail for ${collection.name}`}
						/>
						<div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-md bg-black/60 p-2 text-white">
							<span className="font-semibold">{collection.name}</span>
							<span>{collection.photoCount}</span>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

export default function Collections() {
	const collections = api.collections.all.useQuery();

	const [search, setSearch] = useState("");

	return (
		<>
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Input onChange={(val) => setSearch(val.target.value)} />
			</div>
			<div className="grid grid-flow-row grid-cols-1 gap-4 py-4 lg:grid-cols-2 2xl:grid-cols-3">
				{collections.data ? (
					collections.data
						.filter((c) => c.name.includes(search))
						.map((collection) => (
							<div className="relative aspect-3/2" key={collection.id}>
								<Link href={`/collections/${collection.id}`}>
									{/* biome-ignore lint/performance/noImgElement: S3 images managed externally */}
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
						))
				) : (
					<Skeleton className="aspect-3/2 rounded-xl" />
				)}
			</div>
		</>
	);
}

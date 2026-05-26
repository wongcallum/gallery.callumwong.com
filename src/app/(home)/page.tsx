"use client";

import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

export default function HomePage() {
	const collections = api.collections.all.useQuery();

	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);

	const filteredCollections = collections.data?.filter((c) =>
		c.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="w-full p-4">
			<div className="mb-4 flex items-center gap-2">
				<Input
					placeholder="Search collections..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
				{filteredCollections ? (
					filteredCollections.length > 0 ? (
						filteredCollections.map((c) => (
							<Link
								key={c.id}
								href={`/${c.slug}`}
								className="relative aspect-3/2 cursor-pointer overflow-hidden rounded-md"
							>
								{c.displayThumbnailURL ? (
									/* biome-ignore lint/performance/noImgElement: S3 images managed externally */
									<img
										className="h-full w-full object-cover"
										src={c.displayThumbnailURL}
										alt={`Thumbnail for ${c.name}`}
									/>
								) : (
									<span className="flex h-full w-full items-center justify-center">
										No thumbnail
									</span>
								)}
								<div className="absolute right-0 bottom-0 left-0 flex items-end justify-between bg-black/60 p-2 text-white">
									<span className="pr-2 font-semibold">{c.name}</span>
									<span title={`${c.photoCount} photos`}>{c.photoCount}</span>
								</div>
							</Link>
						))
					) : (
						<p className="text-muted-foreground">No collections found</p>
					)
				) : (
					<Skeleton className="aspect-3/2 rounded-xl" />
				)}
			</div>
		</div>
	);
}

"use client";

import { ArrowLeft } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Gallery from "~/components/gallery/gallery";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { api, type RouterOutputs } from "~/trpc/react";
import "react-photo-album/rows.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/styles.css";

type SearchOutput = RouterOutputs["photos"]["searchPaginated"];

const PAGE_SIZE = 50;

export default function HomePage() {
	const utils = api.useUtils();
	const collections = api.collections.all.useQuery();

	const [collection, setCollection] = useQueryState(
		"collection",
		parseAsInteger,
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);

	const [searchData, setSearchData] = useState<SearchOutput | undefined>();
	const [countData, setCountData] = useState<number>();

	const fetchPhotos = useDebouncedCallback(
		async () => {
			if (collection == null) return;
			setSearchData(
				await utils.photos.searchPaginated.fetch({
					collection,
					page,
					pageSize: PAGE_SIZE,
				}),
			);
			setCountData(
				await utils.photos.count.fetch({
					collection,
				}),
			);
		},
		500,
		{ leading: true },
	);

	const prevCollectionRef = useRef(collection);
	useEffect(() => {
		if (prevCollectionRef.current !== collection && page !== 1) {
			setPage(1);
		}
		prevCollectionRef.current = collection;
	}, [collection, page, setPage]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchPhotos already includes all filter dependencies
	useEffect(() => {
		fetchPhotos();
	}, [collection, page]);

	const selectedCollection = collection
		? collections.data?.find((c) => c.id === collection)
		: null;

	const filteredCollections = collections.data?.filter((c) =>
		c.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="w-full p-4">
			<div className="mb-4 flex items-center gap-2">
				{collection == null ? (
					<Input
						placeholder="Search collections..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				) : (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setCollection(null);
							setPage(1);
						}}
					>
						<ArrowLeft className="mr-1 h-4 w-4" />
						Back
					</Button>
				)}
			</div>

			{selectedCollection && (
				<div className="mb-4">
					<h2 className="font-bold text-2xl">{selectedCollection.name}</h2>
					{selectedCollection.description && (
						<p className="text-muted-foreground">
							{selectedCollection.description}
						</p>
					)}
				</div>
			)}

			{collection == null ? (
				<div className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
					{filteredCollections ? (
						filteredCollections.length > 0 ? (
							filteredCollections.map((c) => (
								<button
									type="button"
									key={c.id}
									className="relative aspect-3/2 cursor-pointer overflow-hidden rounded-md"
									onClick={() => setCollection(c.id)}
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
								</button>
							))
						) : (
							<p className="text-muted-foreground">No collections found</p>
						)
					) : (
						<Skeleton className="aspect-3/2 rounded-xl" />
					)}
				</div>
			) : (
				<>
					{searchData ? (
						searchData.length > 0 ? (
							<Gallery photos={searchData} />
						) : (
							<div className="flex justify-center">
								<p className="text-muted-foreground">No photos found</p>
							</div>
						)
					) : (
						<Skeleton className="aspect-3/2 h-50 rounded-xl" />
					)}

					{countData ? (
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={() => setPage(page > 1 ? page - 1 : 1)}
									/>
								</PaginationItem>
								{Array(Math.ceil(countData / PAGE_SIZE))
									.fill(null)
									.map((_value, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: pagination items have no stable id
										<PaginationItem key={index}>
											<PaginationLink
												href="#"
												onClick={() => setPage(index + 1)}
											>
												{index + 1}
											</PaginationLink>
										</PaginationItem>
									))}
								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={() =>
											setPage(page < countData / PAGE_SIZE ? page + 1 : page)
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					) : null}
				</>
			)}
		</div>
	);
}

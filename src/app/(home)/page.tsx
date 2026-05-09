"use client";

import { ArrowLeft } from "lucide-react";
import {
	parseAsArrayOf,
	parseAsBoolean,
	parseAsInteger,
	parseAsIsoDate,
	parseAsString,
	useQueryState,
	useQueryStates,
} from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Gallery from "~/components/gallery/gallery";
import { TagSelect } from "~/components/tag-select";
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
import {
	Sidebar,
	SidebarContent,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { api, type RouterOutputs } from "~/trpc/react";
import "react-photo-album/rows.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/styles.css";
import { CollectionSelect } from "~/components/collection-select";
import TagsFilter from "./_components/tags-filter";

type SearchOutput = RouterOutputs["photos"]["searchPaginated"];

const PAGE_SIZE = 50;

export default function HomePage() {
	const utils = api.useUtils();
	const collections = api.collections.all.useQuery();

	const [collectionsMode, setCollectionsMode] = useQueryState(
		"collections",
		parseAsBoolean.withDefault(true),
	);
	const [collection, setCollection] = useQueryState(
		"collection",
		parseAsInteger,
	);
	const [tags, setTags] = useQueryState(
		"tags",
		parseAsArrayOf(parseAsInteger).withDefault([]),
	);
	const [camera, setCamera] = useQueryState("camera", parseAsInteger);
	const [lens, setLens] = useQueryState("lens", parseAsInteger);
	const [date, setDate] = useQueryStates({
		from: parseAsIsoDate,
		to: parseAsIsoDate,
	});
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);

	const showPhotos = !collectionsMode || collection != null;

	const [searchData, setSearchData] = useState<SearchOutput | undefined>();
	const [countData, setCountData] = useState<number>();

	const fetchPhotos = useDebouncedCallback(
		async () => {
			if (!showPhotos) return;
			setSearchData(
				await utils.photos.searchPaginated.fetch({
					tags,
					collection,
					camera,
					lens,
					date,
					page,
					pageSize: PAGE_SIZE,
				}),
			);
			setCountData(
				await utils.photos.count.fetch({
					tags,
					collection,
					camera,
					lens,
					date,
				}),
			);
		},
		500,
		{ leading: true },
	);

	const prevFiltersRef = useRef({ tags, collection, camera, lens, date });
	useEffect(() => {
		const prev = prevFiltersRef.current;
		const changed =
			JSON.stringify(prev.tags) !== JSON.stringify(tags) ||
			prev.collection !== collection ||
			prev.camera !== camera ||
			prev.lens !== lens ||
			JSON.stringify(prev.date) !== JSON.stringify(date);

		if (changed && page !== 1) {
			setPage(1);
		}

		prevFiltersRef.current = { tags, collection, camera, lens, date };
	}, [tags, collection, camera, lens, date, page, setPage]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchPhotos already includes all filter dependencies
	useEffect(() => {
		fetchPhotos();
	}, [tags, collection, camera, lens, date, page, collectionsMode]);

	const selectedCollection = collection
		? collections.data?.find((c) => c.id === collection)
		: null;

	const filteredCollections = collections.data?.filter((c) =>
		c.name.toLowerCase().includes(search.toLowerCase()),
	);

	const handleClearAll = () => {
		setCamera(null);
		setLens(null);
		setDate({ from: null, to: null });
		setTags([]);
		setCollection(null);
		setPage(1);
	};

	return (
		<>
			<Sidebar>
				<SidebarContent>
					<TagsFilter
						collectionsMode={collectionsMode}
						setCollectionsMode={(checked) => {
							setCollectionsMode(checked);
							if (!checked) {
								setCollection(null);
							}
						}}
						camera={camera?.toString()}
						setCamera={(val) =>
							setCamera(val ? Number.parseInt(val, 10) : null)
						}
						lens={lens?.toString()}
						setLens={(val) => setLens(val ? Number.parseInt(val, 10) : null)}
						date={{
							from: date.from || undefined,
							to: date.to || undefined,
						}}
						setDate={(val) =>
							setDate(
								val
									? { from: val?.from, to: val?.to }
									: { from: null, to: null },
							)
						}
						onClearAll={handleClearAll}
					/>
				</SidebarContent>
			</Sidebar>
			<div className="w-full p-4">
				<div className="mb-4 flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					{collectionsMode && !collection ? (
						<Input
							placeholder="Search collections..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					) : (
						<>
							{collectionsMode && collection && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setCollection(null);
										setTags([]);
										setPage(1);
									}}
								>
									<ArrowLeft className="mr-1 h-4 w-4" />
									Back
								</Button>
							)}
							<div className="flex-1">
								<TagSelect
									value={tags}
									onChange={(val) => {
										setTags(val.map((opt) => opt.value as number));
									}}
								/>
							</div>
							{!collectionsMode && (
								<CollectionSelect
									value={collection?.toString()}
									onChange={(val) =>
										setCollection(val ? Number.parseInt(val, 10) : null)
									}
								/>
							)}
						</>
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

				{collectionsMode && !collection ? (
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
										{/* biome-ignore lint/performance/noImgElement: S3 images managed externally */}
										<img
											className="h-full w-full object-cover"
											src={c.thumbnailPhotoURL || "/frown.svg"}
											alt={`Thumbnail for ${c.name}`}
										/>
										<div className="absolute right-0 bottom-0 left-0 flex items-end justify-between bg-black/60 p-2 text-white">
											<span className="pr-2 font-semibold">{c.name}</span>
											<span title={`${c.photoCount} photos`}>
												{c.photoCount}
											</span>
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
		</>
	);
}

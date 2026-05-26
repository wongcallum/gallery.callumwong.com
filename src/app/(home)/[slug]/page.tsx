"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Gallery from "~/components/gallery/gallery";
import { Button } from "~/components/ui/button";
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

type SearchOutput = RouterOutputs["photos"]["searchPaginated"];

const PAGE_SIZE = 50;

export default function CollectionPage() {
	const params = useParams<{ slug: string }>();
	const router = useRouter();
	const utils = api.useUtils();

	const collectionQuery = api.collections.bySlug.useQuery(params.slug);

	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [searchData, setSearchData] = useState<SearchOutput | undefined>();
	const [countData, setCountData] = useState<number>();

	const collection = collectionQuery.data;

	const fetchPhotos = useDebouncedCallback(
		async () => {
			if (!collection) return;
			setSearchData(
				await utils.photos.searchPaginated.fetch({
					collection: collection.id,
					page,
					pageSize: PAGE_SIZE,
				}),
			);
			setCountData(
				await utils.photos.count.fetch({
					collection: collection.id,
				}),
			);
		},
		500,
		{ leading: true },
	);

	const prevCollectionRef = useRef(collection?.id);
	useEffect(() => {
		if (prevCollectionRef.current !== collection?.id) {
			if (page !== 1) setPage(1);
			setSearchData(undefined);
			setCountData(undefined);
		}
		prevCollectionRef.current = collection?.id;
	}, [collection?.id, page, setPage]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchPhotos includes all filter dependencies
	useEffect(() => {
		fetchPhotos();
	}, [collection?.id, page]);

	if (collectionQuery.isLoading) {
		return (
			<div className="w-full p-4">
				<Skeleton className="mb-4 h-9 w-20 rounded-md" />
				<Skeleton className="mb-4 h-6 w-60 rounded-md" />
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
					{Array.from({ length: 6 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<Skeleton key={i} className="aspect-3/2 rounded-md" />
					))}
				</div>
			</div>
		);
	}

	if (!collection) {
		return (
			<div className="w-full p-4">
				<p className="text-muted-foreground">Collection not found</p>
				<Button variant="ghost" size="sm" onClick={() => router.push("/")}>
					<ArrowLeft className="mr-1 h-4 w-4" />
					Back
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full p-4">
			<div className="mb-4 flex items-center gap-2">
				<Button variant="ghost" size="sm" onClick={() => router.push("/")}>
					<ArrowLeft className="mr-1 h-4 w-4" />
					Back
				</Button>
			</div>

			<div className="mb-4">
				<h2 className="font-bold text-2xl">{collection.name}</h2>
				{collection.description && (
					<p className="text-muted-foreground">{collection.description}</p>
				)}
			</div>

			{searchData ? (
				searchData.length > 0 ? (
					<Gallery photos={searchData} />
				) : (
					<div className="flex justify-center">
						<p className="text-muted-foreground">No photos found</p>
					</div>
				)
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
					{Array.from({ length: 6 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<Skeleton key={i} className="aspect-3/2 rounded-md" />
					))}
				</div>
			)}

			{countData ? (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									setPage(page > 1 ? page - 1 : 1);
								}}
							/>
						</PaginationItem>
						{Array.from(
							{ length: Math.ceil(countData / PAGE_SIZE) },
							(_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: order of pages will not change
								<PaginationItem key={index}>
									<PaginationLink
										href="#"
										onClick={(e) => {
											e.preventDefault();
											setPage(index + 1);
										}}
									>
										{index + 1}
									</PaginationLink>
								</PaginationItem>
							),
						)}
						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									setPage(page < countData / PAGE_SIZE ? page + 1 : page);
								}}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			) : null}
		</div>
	);
}

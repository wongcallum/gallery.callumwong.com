"use client";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsIsoDate,
	useQueryState,
	useQueryStates,
} from "nuqs";
import { type RouterOutputs, api } from "~/trpc/react";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "react-photo-album/rows.css";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Gallery from "~/components/gallery/gallery";
import { TagSelect } from "~/components/tag-select";
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
import { PageSwitcher } from "../_components/page-switcher";
import TagsFilter from "../_components/tags-filter";

type SearchOutput = RouterOutputs["photos"]["searchPaginated"];

const PAGE_SIZE = 10;

export default function Tags() {
	const utils = api.useUtils();

	const [searchData, setSearchData] = useState<SearchOutput | undefined>();
	const [countData, setCountData] = useState<number>();
	const [tags, setTags] = useQueryState<number[]>(
		"tags",
		parseAsArrayOf(parseAsInteger).withDefault([]),
	);
	const [camera, setCamera] = useQueryState<number>("camera", parseAsInteger);
	const [lens, setLens] = useQueryState<number>("lens", parseAsInteger);
	const [date, setDate] = useQueryStates({
		from: parseAsIsoDate,
		to: parseAsIsoDate,
	});
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

	const search = useDebouncedCallback(
		async () => {
			setSearchData(
				await utils.photos.searchPaginated.fetch({
					tags,
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
					camera,
					lens,
					date,
				}),
			);
		},
		500,
		{ leading: true },
	);

	useEffect(() => {
		search();
	}, [search]);

	const prevFiltersRef = useRef({ tags, camera, lens, date });
	useEffect(() => {
		const prevFilters = prevFiltersRef.current;
		const filtersChanged =
			JSON.stringify(prevFilters.tags) !== JSON.stringify(tags) ||
			prevFilters.camera !== camera ||
			prevFilters.lens !== lens ||
			JSON.stringify(prevFilters.date) !== JSON.stringify(date);

		if (filtersChanged && page !== 1) {
			setPage(1);
		}

		prevFiltersRef.current = { tags, camera, lens, date };
	}, [tags, camera, lens, date, page, setPage]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: search function already includes all dependencies
	useEffect(() => {
		search();
	}, [tags, camera, lens, date, page]);

	return (
		<>
			<Sidebar>
				<SidebarContent>
					<PageSwitcher selected="tags" />
					<TagsFilter
						camera={camera?.toString()}
						setCamera={(val) => setCamera(val ? Number.parseInt(val) : null)}
						lens={lens?.toString()}
						setLens={(val) => setLens(val ? Number.parseInt(val) : null)}
						date={{
							from: date.from || undefined,
							to: date.to || undefined,
						}}
						setDate={(val) =>
							setDate(
								val
									? {
											from: val?.from,
											to: val?.to,
										}
									: null,
							)
						}
					/>
				</SidebarContent>
			</Sidebar>
			<div className="w-full p-4">
				<div className="mb-4 flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					<TagSelect
						value={tags}
						onChange={(val) => {
							setTags(val.map((opt) => opt.value as number));
						}}
					/>
				</div>

				{searchData ? (
					<Gallery photos={searchData} />
				) : (
					<Skeleton className="aspect-3/2 h-[200px] rounded-xl" />
				)}

				{countData && (
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
								.map((value, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									<PaginationItem key={index}>
										<PaginationLink
											href="#"
											onClick={() => {
												setPage(index + 1);
											}}
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
				)}
			</div>
		</>
	);
}

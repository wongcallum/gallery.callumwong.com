"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ReactSelect from "~/components/react-select";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { api } from "~/trpc/react";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "react-photo-album/rows.css";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import Gallery from "~/app/(home)/_components/gallery";
import {
	Sidebar,
	SidebarContent,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { PageSwitcher } from "../_components/page-switcher";
import TagsFilter from "../_components/tags-filter";

const ONE_DAY = 24 * 60 * 60 * 1000;

const formSchema = z.object({
	search: z.array(z.coerce.number()),
});

const paramSchema = z.object({
	search: z.string().transform((val) => val.split(",").map(Number)),
});

export default function Tags() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const params = searchParams.has("search")
		? paramSchema.parse({
				search: searchParams.get("search"),
			})
		: { search: [] };

	const tags = api.tags.all.useQuery();
	const searchPhotos = api.photos.search.useQuery({
		tags: params.search,
	});

	const options =
		tags.data?.map((tag) => ({
			value: tag.id,
			label: tag.name,
		})) || [];

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: params,
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		router.push(`?search=${values.search}`);
	}

	const [camera, setCamera] = useState<string>();
	const [lens, setLens] = useState<string>();
	const [date, setDate] = useState<DateRange | undefined>();

	return (
		<>
			<Sidebar>
				<SidebarContent>
					<PageSwitcher selected="tags" />
					<TagsFilter
						camera={camera}
						setCamera={setCamera}
						lens={lens}
						setLens={setLens}
						date={date}
						setDate={setDate}
					/>
				</SidebarContent>
			</Sidebar>
			<div className="w-full p-4">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex items-center gap-2"
					>
						<SidebarTrigger className="-ml-1" />
						<FormField
							control={form.control}
							name="search"
							render={({ field }) => (
								<FormItem className="grow">
									<FormControl>
										<ReactSelect
											isMulti={true}
											options={options}
											ref={field.ref}
											value={options.filter((c) =>
												field.value.includes(c.value),
											)}
											onChange={(val) =>
												field.onChange(val.map((c) => c.value))
											}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<Button type="submit">Search</Button>
					</form>
				</Form>

				{searchPhotos.data ? (
					<Gallery
						photos={searchPhotos.data.filter((photo) => {
							const taken = photo.takenAt?.getTime();
							const from = date?.from?.getTime();
							const to = date?.to?.getTime();

							const filterCamera =
								!camera || photo.cameraId?.toString() === camera;
							const filterLens = !lens || photo.lensId?.toString() === lens;
							const filterDate =
								!taken ||
								!from ||
								!to ||
								(taken >= from && taken < to + ONE_DAY);

							return filterCamera && filterLens && filterDate;
						})}
					/>
				) : (
					<>
						<Skeleton className="h-[125px] w-[250px] rounded-xl" />
					</>
				)}
			</div>
		</>
	);
}

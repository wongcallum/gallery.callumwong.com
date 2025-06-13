"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { api } from "~/trpc/react";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "react-photo-album/rows.css";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import Gallery from "~/components/gallery/gallery";
import { TagSelect } from "~/components/tag-select";
import {
	Sidebar,
	SidebarContent,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { PageSwitcher } from "../_components/page-switcher";
import TagsFilter from "../_components/tags-filter";

const formSchema = z.object({
	search: z.array(z.coerce.number()),
});

export default function Tags() {
	const searchMutation = api.photos.search.useMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			search: [],
		},
	});

	useEffect(() => {
		searchMutation.mutate({ tags: [] });
	}, [searchMutation.mutate]);

	function onSubmit(values: z.infer<typeof formSchema>) {
		searchMutation.mutate({
			tags: values.search,
			camera: camera ? Number.parseInt(camera) : undefined,
			lens: lens ? Number.parseInt(lens) : undefined,
			date,
		});
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
				<div className="mb-4 flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex grow items-center gap-2"
						>
							<FormField
								control={form.control}
								name="search"
								render={({ field }) => (
									<FormItem className="grow">
										<FormControl>
											<TagSelect
												ref={field.ref}
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
				</div>

				{searchMutation.data ? (
					<Gallery photos={searchMutation.data} />
				) : (
					<Skeleton className="aspect-3/2 h-[200px] rounded-xl" />
				)}
			</div>
		</>
	);
}

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
import Gallery from "~/app/(home)/_components/gallery";
import { SidebarTrigger } from "~/components/ui/sidebar";

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

	return (
		<>
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
										value={options.filter((c) => field.value.includes(c.value))}
										onChange={(val) => field.onChange(val.map((c) => c.value))}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<Button type="submit">Search</Button>
				</form>
			</Form>

			<Gallery photos={searchPhotos.data || []} />
		</>
	);
}

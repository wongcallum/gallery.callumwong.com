"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "react-photo-album/rows.css";
import Link from "next/link";
import Gallery from "~/components/gallery";

export default function CollectionPage() {
	const params = useParams<{ id: string }>();

	const { isPending, error, data } = api.collections.withPhotos.useQuery(
		Number.parseInt(params.id),
	);

	if (isPending) {
		return <>Loading...</>;
	}

	if (error) {
		return <>Error: {error.message}</>;
	}

	return (
		<>
			<Link href="/collections">Back</Link>

			<h1 className="font-bold text-2xl">{data.name}</h1>
			<p className="">{data.description}</p>

			<Gallery photos={data.photos || []} />
		</>
	);
}

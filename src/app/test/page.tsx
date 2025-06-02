"use client";

import { api } from "~/trpc/react";

export default function Test() {
	const { data } = api.photos.list.useQuery();

	return data;
}

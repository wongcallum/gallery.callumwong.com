import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 2xl:grid-cols-3">
			{Array.from({ length: 6 }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: this is literally just a skeleton bro
				<Skeleton key={i} className="aspect-3/2 rounded-md" />
			))}
		</div>
	);
}

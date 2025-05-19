import { DataTable } from "~/components/data-table";
import { columns } from "./columns";

export default async function TagsPage() {
	return (
		<DataTable
			filterPlaceholder="Filter tags..."
			filterColumn="tag"
			columns={columns}
			data={[
				{
					tag: "sunset",
					images: 10,
				},
				{
					tag: "landscape",
					images: 51,
				},
			]}
		/>
	);
}

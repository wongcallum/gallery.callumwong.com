import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { columns } from "./columns";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogFooter,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

export default async function CollectionsPage() {
	return (
		<DataTable
			columns={columns}
			data={[
				{
					name: "Japan 2023-24",
					description: "Japan",
					images: 1,
					location: "Japan",
				},
				{
					name: "Hong Kong 2024-25",
					description: "asddad",
					images: 51,
					location: "Hong Kong",
				},
			]}
		>
			<Dialog>
				<DialogTrigger asChild>
					<Button>New collection</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add collection</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input id="name" value="name" className="col-span-3" />
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="description" className="text-right">
								Description
							</Label>
							<Input id="description" value="desc" className="col-span-3" />
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="location" className="text-right">
								Location
							</Label>
							<Input id="location" value="loc" className="col-span-3" />
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Save changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</DataTable>
	);
}

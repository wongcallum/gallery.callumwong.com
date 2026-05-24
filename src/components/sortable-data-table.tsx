"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { Input } from "./ui/input";

interface SortableDataTableProps<
	TData extends { id: number | string },
	TValue,
> {
	filterPlaceholder: string;
	filterColumn: string;
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onReorder: (args: {
		activeId: number;
		beforeId: number | null;
		afterId: number | null;
	}) => void;
	children?: React.ReactNode;
}

export function SortableDataTable<
	TData extends { id: number | string },
	TValue,
>({
	filterPlaceholder,
	filterColumn,
	columns,
	data,
	onReorder,
	children,
}: SortableDataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const table = useReactTable({
		data,
		columns,
		getRowId: (row) => String(row.id),
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const rows = table.getRowModel().rows;
	const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIdx = rows.findIndex((r) => r.id === active.id);
		const newIdx = rows.findIndex((r) => r.id === over.id);
		if (oldIdx === -1 || newIdx === -1) return;

		const reordered = arrayMoveLocal(rows, oldIdx, newIdx);
		const movedAt = reordered.findIndex((r) => r.id === active.id);
		const beforeRow = reordered[movedAt - 1];
		const afterRow = reordered[movedAt + 1];

		onReorder({
			activeId: Number(active.id),
			beforeId: beforeRow ? Number(beforeRow.id) : null,
			afterId: afterRow ? Number(afterRow.id) : null,
		});
	}

	return (
		<div>
			<div className="flex items-center gap-2 py-4">
				<Input
					placeholder={filterPlaceholder}
					value={
						(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table.getColumn(filterColumn)?.setFilterValue(event.target.value)
					}
					className="w-full"
				/>
				{children}
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										style={{ width: header.getSize() }}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={rowIds}
							strategy={verticalListSortingStrategy}
						>
							<TableBody>
								{rows.length ? (
									rows.map((row) => <SortableRow key={row.id} row={row} />)
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</SortableContext>
					</DndContext>
				</Table>
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}

function SortableRow<TData>({ row }: { row: Row<TData> }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: row.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<TableRow ref={setNodeRef} style={style}>
			{row.getVisibleCells().map((cell) => {
				if (cell.column.id === "drag") {
					return (
						<TableCell key={cell.id} className="w-8">
							<button
								type="button"
								{...attributes}
								{...listeners}
								className="cursor-grab text-muted-foreground active:cursor-grabbing"
								aria-label="Drag to reorder"
							>
								<GripVertical className="h-4 w-4" />
							</button>
						</TableCell>
					);
				}
				return (
					<TableCell key={cell.id}>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				);
			})}
		</TableRow>
	);
}

function arrayMoveLocal<T>(arr: T[], from: number, to: number): T[] {
	const copy = arr.slice();
	const [item] = copy.splice(from, 1);
	if (item !== undefined) copy.splice(to, 0, item);
	return copy;
}

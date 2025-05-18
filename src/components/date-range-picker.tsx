"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface DatePickerWithRangeProps {
	date: DateRange | undefined;
	setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange(props: DatePickerWithRangeProps) {
	return (
		<div className="grid gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"justify-start text-left font-normal",
							!props.date && "text-muted-foreground",
						)}
					>
						<CalendarIcon />
						{props.date?.from ? (
							props.date.to ? (
								<>
									{format(props.date.from, "LLL dd, y")} -{" "}
									{format(props.date.to, "LLL dd, y")}
								</>
							) : (
								format(props.date.from, "LLL dd, y")
							)
						) : (
							<span>All dates</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={props.date?.from}
						selected={props.date}
						onSelect={props.setDate}
						numberOfMonths={1}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { FormControl } from "./ui/form";

interface ComboBoxOption {
	value: string;
	label: string;
}

interface ComboBoxProps {
	options: ComboBoxOption[];
	value?: string;
	setValue: (value: string) => void;
	placeholder: string;
	formControl?: boolean;
}

export function Combobox({
	options,
	value,
	setValue,
	placeholder,
	formControl,
	...props
}: ComboBoxProps & React.ComponentProps<"button">) {
	const [open, setOpen] = React.useState(false);

	const trigger = (
		<Button
			variant="outline"
			// biome-ignore lint/a11y/useSemanticElements: <explanation>
			role="combobox"
			aria-expanded={open}
			className="justify-between"
			{...props}
		>
			<span className="truncate">
				{value
					? options.find((framework) => framework.value === value)?.label
					: placeholder}
			</span>
			<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{formControl ? <FormControl>{trigger}</FormControl> : trigger}
			</PopoverTrigger>
			<PopoverContent className="p-0">
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandList>
						<CommandEmpty>Nothing to be seen here...</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

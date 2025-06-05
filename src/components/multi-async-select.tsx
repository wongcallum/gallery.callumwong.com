"use client";
import { CheckIcon, ChevronDown, X, XIcon } from "lucide-react";
import * as React from "react";

import { useEffect, useRef } from "react";
import { FadeLoader } from "react-spinners";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface Option {
	label: string;
	value: string; // should be unique, and not empty
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * An array of objects to be displayed in the Select.Option.
	 */
	options: Option[];

	/**
	 * Whether the select is async. If true, the getting options should be async.
	 * Optional, defaults to false.
	 */
	async?: boolean;

	/**
	 * Whether is fetching options. If true, the loading indicator will be shown.
	 * Optional, defaults to false. Works only when async is true.
	 */
	loading?: boolean;

	/**
	 * The error object. If true, the error message will be shown.
	 * Optional, defaults to null. Works only when async is true.
	 */
	error?: Error | null;

	/** The default selected values when the component mounts. */
	defaultValue?: string[];

	/**
	 * Placeholder text to be displayed when no values are selected.
	 * Optional, defaults to "Select options".
	 */
	placeholder?: string;

	/**
	 * Placeholder text to be displayed when the search input is empty.
	 * Optional, defaults to "Search...".
	 */
	searchPlaceholder?: string;

	/**
	 * Maximum number of items to display. Extra selected items will be summarized.
	 * Optional, defaults to 3.
	 */
	maxCount?: number;

	/**
	 * The modality of the popover. When set to true, interaction with outside elements
	 * will be disabled and only popover content will be visible to screen readers.
	 * Optional, defaults to false.
	 */
	modalPopover?: boolean;

	/**
	 * Additional class names to apply custom styles to the multi-select component.
	 * Optional, can be used to add custom styles.
	 */
	className?: string;

	/**
	 * Text to be displayed when the clear button is clicked.
	 * Optional, defaults to "Clear".
	 */
	clearText?: string;

	/**
	 * Text to be displayed when the close button is clicked.
	 * Optional, defaults to "Close".
	 */
	closeText?: string;

	/**
	 * Callback function triggered when the selected values change.
	 * Receives an array of the new selected values.
	 */
	onValueChange: (value: string[]) => void;

	/**
	 * Callback function triggered when the search input changes.
	 * Receives the search input value.
	 */
	onSearch?: (value: string) => void;
}

export const MultiAsyncSelect = React.forwardRef<HTMLButtonElement, Props>(
	(
		{
			options,
			onValueChange,
			onSearch,
			defaultValue = [],
			placeholder = "Select options",
			searchPlaceholder = "Search...",
			clearText = "Clear",
			closeText = "Close",
			maxCount = 3,
			modalPopover = false,
			className,
			loading = false,
			async = false,
			error = null,
			...props
		},
		ref,
	) => {
		const [selectedValues, setSelectedValues] =
			React.useState<string[]>(defaultValue);
		const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
		const optionsRef = useRef<Record<string, Option>>({});

		const handleInputKeyDown = (
			event: React.KeyboardEvent<HTMLInputElement>,
		) => {
			// 如果按下的是回车键，则保持弹窗打开
			if (event.key === "Enter") {
				setIsPopoverOpen(true);
			} else if (event.key === "Backspace" && !event.currentTarget.value) {
				// 如果按下的是退格键并且输入框为空，则删除最后一个选中的值
				const newSelectedValues = [...selectedValues];
				newSelectedValues.pop();
				setSelectedValues(newSelectedValues);
				onValueChange(newSelectedValues);
			}
		};

		const toggleOption = (option: string) => {
			const isAddon = selectedValues.includes(option);
			const newSelectedValues = isAddon
				? selectedValues.filter((value) => value !== option)
				: [...selectedValues, option];
			setSelectedValues(newSelectedValues);
			onValueChange(newSelectedValues);
		};

		const handleClear = () => {
			setSelectedValues([]);
			onValueChange([]);
		};

		const handleTogglePopover = () => {
			setIsPopoverOpen((prev) => !prev);
		};

		const clearExtraOptions = () => {
			const newSelectedValues = selectedValues.slice(0, maxCount);
			setSelectedValues(newSelectedValues);
			onValueChange(newSelectedValues);
		};

		const toggleAll = () => {
			if (selectedValues.length === options.length) {
				handleClear();
			} else {
				const allValues = options.map((option) => option.value);
				setSelectedValues(allValues);
				onValueChange(allValues);
			}
		};

		// 使用 optionsRef 来记录 options 已选项目，同时控制其 size 减少对性能的影响
		useEffect(() => {
			const temp = options.reduce(
				(acc, option) => {
					acc[option.value] = option;
					return acc;
				},
				{} as Record<string, Option>,
			);
			if (async) {
				// 当 options 变化时，仅保留上一次 selectedValues 中存在的选项
				const temp2 = selectedValues.reduce(
					(acc, value) => {
						const option = optionsRef.current[value];
						if (option) {
							acc[option.value] = option;
						}
						return acc;
					},
					{} as Record<string, Option>,
				);
				optionsRef.current = {
					...temp,
					...temp2,
				};
			}
		}, [async, options, selectedValues]);

		return (
			<Popover
				open={isPopoverOpen}
				onOpenChange={setIsPopoverOpen}
				modal={modalPopover}
			>
				<PopoverTrigger asChild>
					<Button
						ref={ref}
						{...props}
						onClick={handleTogglePopover}
						className={cn(
							"flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white hover:bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 dark:hover:bg-black [&>span]:line-clamp-1 [&_svg]:pointer-events-auto",
							className,
						)}
					>
						{selectedValues.length > 0 ? (
							<div className="flex w-full items-center justify-between gap-2">
								<div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
									{selectedValues.slice(0, maxCount).map((value) => {
										let option: Option | undefined;
										if (async) {
											option = optionsRef.current[value];
										} else {
											option = options.find((option) => option.value === value);
										}
										return (
											<Badge key={value}>
												<span>{option?.label}</span>
												<div
													className="ml-2 size-4 cursor-pointer"
													onClick={(event) => {
														event.stopPropagation();
														toggleOption(value);
													}}
												>
													<X />
												</div>
											</Badge>
										);
									})}
									{selectedValues.length > maxCount && (
										<Badge>
											<span>{`+ ${selectedValues.length - maxCount}`}</span>

											<div
												className="ml-2 size-4 cursor-pointer"
												onClick={(event) => {
													event.stopPropagation();
													clearExtraOptions();
												}}
											>
												<X />
											</div>
										</Badge>
									)}
								</div>
								<div className="flex items-center justify-between">
									<XIcon
										className="h-4 cursor-pointer text-zinc-500"
										onClick={(event) => {
											event.stopPropagation();
											handleClear();
										}}
									/>
									<Separator
										orientation="vertical"
										className="mx-2 flex h-full min-h-6"
									/>
									<ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
								</div>
							</div>
						) : (
							<div className="mx-auto flex w-full items-center justify-between gap-2">
								<span className="font-normal text-sm text-zinc-500">
									{placeholder}
								</span>
								<ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
							</div>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0"
					align="start"
					onEscapeKeyDown={() => setIsPopoverOpen(false)}
				>
					<Command shouldFilter={!async}>
						<CommandInput
							placeholder={searchPlaceholder}
							onValueChange={(value) => {
								if (onSearch) {
									onSearch(value);
								}
							}}
							onKeyDown={handleInputKeyDown}
						/>
						<CommandList>
							{async && error && (
								<div className="p-4 text-center text-destructive">
									{error.message}
								</div>
							)}
							{async && loading && options.length === 0 && (
								<div className="flex h-full items-center justify-center py-6">
									<FadeLoader
										color="#ffa500"
										style={{
											transform: "scale(0.38)",
											position: "relative",
											top: "-1px",
										}}
									/>
								</div>
							)}
							{async ? (
								!loading &&
								!error &&
								options.length === 0 && (
									<div className="pt-6 pb-4 text-center text-sm">
										{`No ${placeholder.toLowerCase()} found.`}
									</div>
								)
							) : (
								<CommandEmpty>
									{`No ${placeholder.toLowerCase()} found.`}
								</CommandEmpty>
							)}
							<CommandGroup>
								{/* 异步模式不需要全选 */}
								{!async && (
									<CommandItem
										key="all"
										onSelect={toggleAll}
										className="cursor-pointer"
									>
										<div
											className={cn(
												"mr-1 size-4 rounded-[4px] border border-primary text-center shadow-xs outline-none transition-shadow",
												selectedValues.length === options.length
													? "border-primary bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className="size-3.5 text-white dark:text-black" />
										</div>
										<span>Select all</span>
									</CommandItem>
								)}
								{options.map((option) => {
									const isSelected = selectedValues.includes(option.value);
									return (
										<CommandItem
											key={option.value}
											onSelect={() => toggleOption(option.value)}
											className="cursor-pointer"
										>
											<div
												className={cn(
													"mr-1 size-4 rounded-[4px] border border-primary text-center shadow-xs outline-none transition-shadow",
													isSelected
														? "border-primary bg-primary text-primary-foreground"
														: "opacity-50 [&_svg]:invisible",
												)}
											>
												<CheckIcon className="size-3.5 text-white dark:text-black" />
											</div>
											<span>{option.label}</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup>
								<div className="flex items-center justify-between">
									{selectedValues.length > 0 && (
										<>
											<CommandItem
												onSelect={handleClear}
												className="flex-1 cursor-pointer justify-center"
											>
												{clearText}
											</CommandItem>
											<Separator
												orientation="vertical"
												className="flex h-full min-h-6"
											/>
										</>
									)}
									<CommandItem
										onSelect={() => setIsPopoverOpen(false)}
										className="max-w-full flex-1 cursor-pointer justify-center"
									>
										{closeText}
									</CommandItem>
								</div>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		);
	},
);

MultiAsyncSelect.displayName = "MultiAsyncSelect";

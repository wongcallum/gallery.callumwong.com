import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export function shutterSpeedString(speed: number | null) {
	if (!speed) return "N/A";
	if (speed > 0.25) return speed.toString();
	return `1/${1 / speed}`;
}

export function apertureString(fStop: number | null) {
	if (!fStop || fStop === 0) return "f/00";
	return `f/${fStop.toFixed(1)}`;
}

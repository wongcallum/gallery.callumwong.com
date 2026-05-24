import { TRPCError } from "@trpc/server";

export const MAX_ORDER = 2147483647;

export function computeNewOrder(
	beforeOrder: number | null,
	afterOrder: number | null,
): number {
	const lo = beforeOrder ?? 0;
	const hi = afterOrder ?? MAX_ORDER;
	const mid = Math.floor((lo + hi) / 2);
	if (mid === lo || mid === hi) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Not enough space in collection ordering!",
		});
	}
	return mid;
}

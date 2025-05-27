import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cameras, lenses } from "~/server/db/schema";

export const filterRouter = createTRPCRouter({
	cameras: publicProcedure.query(async ({ ctx }) => {
		const cameraModels = await ctx.db
			.select({
				id: cameras.id,
				name: cameras.name,
			})
			.from(cameras);

		return cameraModels;
	}),

	lens: publicProcedure.query(async ({ ctx }) => {
		const lensModels = await ctx.db
			.select({
				id: lenses.id,
				name: lenses.name,
			})
			.from(lenses);

		return lensModels;
	}),
});

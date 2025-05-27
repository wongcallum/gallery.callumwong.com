import { count, eq } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { collections, photos } from "~/server/db/schema";

export const collectionRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().min(1),
				location: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(collections).values({
				name: input.name,
				description: input.description,
				location: input.location,
				createdById: ctx.session.user.id,
			});
		}),

	all: publicProcedure.query(async ({ ctx }) => {
		const allCollections = await ctx.db
			.select({
				name: collections.name,
				description: collections.description,
				location: collections.location,
				photoCount: count(photos.id),
			})
			.from(collections)
			.leftJoin(photos, eq(collections.id, photos.collectionId))
			.groupBy(collections.id)
			.orderBy(collections.name);

		return allCollections;
	}),
});

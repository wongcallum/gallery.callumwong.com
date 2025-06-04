import { count, eq } from "drizzle-orm";
import { createCollectionSchema } from "~/lib/schemas";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { collections, photos } from "~/server/db/schema";

export const collectionRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createCollectionSchema)
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
				id: collections.id,
				name: collections.name,
				description: collections.description,
				location: collections.location,
				photoCount: count(photos.id),
				thumbnailPhotoURL: collections.thumbnailPhotoURL,
			})
			.from(collections)
			.leftJoin(photos, eq(collections.id, photos.collectionId))
			.groupBy(collections.id)
			.orderBy(collections.name);

		return allCollections;
	}),
});

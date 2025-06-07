import { count, desc, eq } from "drizzle-orm";
import { createCollectionSchema } from "~/lib/schemas";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
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

		for (const collection of allCollections) {
			if (!collection.thumbnailPhotoURL) {
				const latestPhoto = await db
					.select({ url: photos.thumbnailUrl })
					.from(photos)
					.where(eq(photos.collectionId, collection.id))
					.orderBy(desc(photos.takenAt))
					.limit(1);

				collection.thumbnailPhotoURL = latestPhoto[0]?.url || null;
			}
		}

		return allCollections;
	}),
});

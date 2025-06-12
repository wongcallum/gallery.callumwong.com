import { TRPCError } from "@trpc/server";
import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";
import { deletePhoto } from "~/lib/s3";
import { createCollectionSchema } from "~/lib/schemas";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { collections, photos } from "~/server/db/schema";

async function getLatestPhoto(collectionId: number) {
	const latestPhoto = await db
		.select({ url: photos.thumbnailUrl })
		.from(photos)
		.where(eq(photos.collectionId, collectionId))
		.orderBy(desc(photos.takenAt))
		.limit(1);

	return latestPhoto[0]?.url || null;
}

export const collectionRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createCollectionSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(collections).values({
				name: input.name,
				description: input.description,
				priority: input.priority,
				createdById: ctx.session.user.id,
			});
		}),

	modify: protectedProcedure
		.input(
			createCollectionSchema.extend({
				id: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(collections)
				.set({
					name: input.name,
					description: input.description,
					priority: input.priority,
				})
				.where(eq(collections.id, input.id));
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				deletePhotos: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.transaction(async (tx) => {
				if (input.deletePhotos) {
					const deleted = await tx
						.delete(photos)
						.where(eq(photos.collectionId, input.id))
						.returning();

					for (const photo of deleted) {
						await deletePhoto(photo.id);
					}
				} else {
					await tx
						.update(photos)
						.set({
							collectionId: null,
						})
						.where(eq(photos.collectionId, input.id));
				}

				await tx.delete(collections).where(eq(collections.id, input.id));
			});
		}),

	all: publicProcedure.query(async ({ ctx }) => {
		const allCollections = await ctx.db
			.select({
				...getTableColumns(collections),
				photoCount: count(photos.id),
			})
			.from(collections)
			.leftJoin(photos, eq(collections.id, photos.collectionId))
			.groupBy(collections.id)
			.orderBy(desc(collections.priority));

		for (const collection of allCollections) {
			if (!collection.thumbnailPhotoURL) {
				collection.thumbnailPhotoURL = await getLatestPhoto(collection.id);
			}
		}

		return allCollections;
	}),

	withPhotos: publicProcedure
		.input(z.number())
		.query(async ({ ctx, input }) => {
			const collection = await ctx.db.query.collections.findFirst({
				where: eq(collections.id, input),
				with: {
					photos: true,
				},
			});

			if (!collection)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No collection with id found",
				});

			if (!collection.thumbnailPhotoURL) {
				collection.thumbnailPhotoURL = await getLatestPhoto(collection.id);
			}

			return collection;
		}),
});

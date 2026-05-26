import { TRPCError } from "@trpc/server";
import { asc, count, desc, eq, getTableColumns, inArray } from "drizzle-orm";
import { z } from "zod";
import { computeNewOrder, MAX_ORDER } from "~/lib/ordering";
import { deletePhoto } from "~/lib/s3";
import { createCollectionSchema } from "~/lib/schemas";
import { slugify } from "~/lib/utils";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { cameras, collections, lenses, photos } from "~/server/db/schema";

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
			const [first] = await ctx.db
				.select({ displayOrder: collections.displayOrder })
				.from(collections)
				.orderBy(asc(collections.displayOrder))
				.limit(1);

			const displayOrder =
				first?.displayOrder != null
					? Math.floor(first.displayOrder / 2)
					: Math.floor(MAX_ORDER / 2);

			if (first?.displayOrder != null && displayOrder === 0) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Not enough space in collection ordering!",
				});
			}

			await ctx.db.insert(collections).values({
				name: input.name,
				slug: input.slug || slugify(input.name),
				description: input.description,
				thumbnailPhotoURL: input.thumbnailPhotoURL ?? undefined,
				createdById: ctx.session.user.id,
				displayOrder,
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
					slug: input.slug || slugify(input.name),
					description: input.description,
					thumbnailPhotoURL: input.thumbnailPhotoURL ?? null,
				})
				.where(eq(collections.id, input.id));
		}),

	reorder: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				beforeId: z.number().nullable(),
				afterId: z.number().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.transaction(async (tx) => {
				const rows = await tx
					.select({
						id: collections.id,
						displayOrder: collections.displayOrder,
					})
					.from(collections)
					.orderBy(asc(collections.displayOrder), asc(collections.id));

				if (rows.some((r) => r.displayOrder === null)) {
					const step = Math.floor(MAX_ORDER / (rows.length + 1));
					for (let i = 0; i < rows.length; i++) {
						const row = rows[i];
						if (!row || row.displayOrder !== null) continue;
						await tx
							.update(collections)
							.set({ displayOrder: step * (i + 1) })
							.where(eq(collections.id, row.id));
					}
				}

				const ids = [input.beforeId, input.afterId].filter(
					(v): v is number => v !== null,
				);
				const neighbors = ids.length
					? await tx
							.select({
								id: collections.id,
								displayOrder: collections.displayOrder,
							})
							.from(collections)
							.where(inArray(collections.id, ids))
					: [];
				const before = neighbors.find((n) => n.id === input.beforeId);
				const after = neighbors.find((n) => n.id === input.afterId);
				const newOrder = computeNewOrder(
					before?.displayOrder ?? null,
					after?.displayOrder ?? null,
				);
				await tx
					.update(collections)
					.set({ displayOrder: newOrder })
					.where(eq(collections.id, input.id));
			});
		}),

	photos: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
		return ctx.db
			.select({
				id: photos.id,
				thumbnailUrl: photos.thumbnailUrl,
			})
			.from(photos)
			.where(eq(photos.collectionId, input))
			.orderBy(desc(photos.takenAt));
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
			.orderBy(asc(collections.displayOrder), asc(collections.id));

		return Promise.all(
			allCollections.map(async (collection) => ({
				...collection,
				displayThumbnailURL:
					collection.thumbnailPhotoURL ?? (await getLatestPhoto(collection.id)),
			})),
		);
	}),

	bySlug: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const collection = await ctx.db
			.select(getTableColumns(collections))
			.from(collections)
			.where(eq(collections.slug, input))
			.then((rows) => rows[0]);

		if (!collection) return null;

		if (!collection.thumbnailPhotoURL) {
			collection.thumbnailPhotoURL = await getLatestPhoto(collection.id);
		}

		return collection;
	}),

	withPhotos: publicProcedure
		.input(z.number())
		.query(async ({ ctx, input }) => {
			const collection = await ctx.db
				.select({
					...getTableColumns(collections),
				})
				.from(collections)
				.where(eq(collections.id, input))
				.then((rows) => rows[0]);

			if (!collection)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No collection with id found",
				});

			const photosData = await ctx.db
				.select({
					...getTableColumns(photos),
					cameraName: cameras.name,
					lensName: lenses.name,
				})
				.from(photos)
				.leftJoin(cameras, eq(photos.cameraId, cameras.id))
				.leftJoin(lenses, eq(photos.lensId, lenses.id))
				.where(eq(photos.collectionId, input));

			if (!collection.thumbnailPhotoURL) {
				collection.thumbnailPhotoURL = await getLatestPhoto(collection.id);
			}

			return {
				...collection,
				photos: photosData,
			};
		}),
});

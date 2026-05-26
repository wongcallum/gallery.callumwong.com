import { PutObjectCommand, S3ServiceException } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import {
	and,
	desc,
	eq,
	getTableColumns,
	gte,
	lte,
	type SQL,
} from "drizzle-orm";
import exifr from "exifr";
import sharp from "sharp";
import { z } from "zod";
import { env } from "~/env";
import s3Client, { deletePhoto } from "~/lib/s3";
import { editPhotoSchema, importPhotoSchema } from "~/lib/schemas";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import type { DB } from "~/server/db";
import { cameras, lenses, photos } from "~/server/db/schema";

async function insertOrSelectLens(
	tx: DB,
	model: string,
): Promise<typeof lenses.$inferSelect | undefined> {
	if (!model) return;
	const insertedLens = await tx
		.insert(lenses)
		.values({
			name: model,
		})
		.onConflictDoNothing()
		.returning();

	if (insertedLens.length > 0) {
		return insertedLens[0];
	}

	return await tx.query.lenses.findFirst({
		where: (lenses, { eq }) => eq(lenses.name, model),
	});
}

async function insertOrSelectCamera(
	tx: DB,
	model: string,
): Promise<typeof cameras.$inferSelect | undefined> {
	if (!model) return;
	const insertedCamera = await tx
		.insert(cameras)
		.values({
			name: model,
		})
		.onConflictDoNothing()
		.returning();

	if (insertedCamera.length > 0) {
		return insertedCamera[0];
	}

	return await tx.query.cameras.findFirst({
		where: (cameras, { eq }) => eq(cameras.name, model),
	});
}

const filterInput = z.object({
	collection: z.number().optional().nullable(),
	camera: z.number().optional().nullable(),
	lens: z.number().optional().nullable(),
	date: z
		.object({
			from: z.date().nullable(),
			to: z.date().nullable(),
		})
		.optional(),
});

export const photoRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z
				.instanceof(FormData)
				.transform((fd) => Object.fromEntries(fd.entries()))
				.transform((obj) => ({
					...obj,
					exif: String(obj.exif) === "true",
				}))
				.pipe(importPhotoSchema),
		)
		.mutation(async ({ ctx, input }) => {
			const image = await input.image.arrayBuffer();

			const collectionId = input.collection
				? Number.parseInt(input.collection, 10)
				: null;

			const collection = collectionId
				? await ctx.db.query.collections.findFirst({
						where: (collections, { eq }) => eq(collections.id, collectionId),
					})
				: null;

			const id = crypto.randomUUID();
			const thumbnailKey = `${id}-thumb`;

			// process images
			const optimised = sharp(image)
				.rotate()
				.resize({
					width: 2160,
					height: 2160,
					fit: "inside",
					withoutEnlargement: true,
				})
				.toFormat("jpeg", {
					quality: 80,
					mozjpeg: true,
				});

			const { width, height } = await optimised.metadata();
			const optimisedBuffer = await optimised.toBuffer();

			const thumbnail = sharp(optimisedBuffer)
				.resize({
					width: 1080,
					height: 1080,
					fit: "inside",
				})
				.toFormat("webp", {
					quality: 60,
					effort: 2,
				});

			const { width: thumbnailWidth, height: thumbnailHeight } =
				await thumbnail.metadata();
			const thumbnailBuffer = await thumbnail.toBuffer();

			// upload images
			try {
				await s3Client.send(
					new PutObjectCommand({
						Bucket: env.AWS_S3_BUCKET_NAME,
						Key: id,
						Body: optimisedBuffer,
					}),
				);
				await s3Client.send(
					new PutObjectCommand({
						Bucket: env.AWS_S3_BUCKET_NAME,
						Key: thumbnailKey,
						Body: thumbnailBuffer,
					}),
				);
			} catch (caught) {
				if (
					caught instanceof S3ServiceException &&
					caught.name === "EntityTooLarge"
				) {
					throw new TRPCError({
						code: "PAYLOAD_TOO_LARGE",
						message: "Uploaded file is too large!",
					});
				}

				if (caught instanceof Error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: caught.message,
					});
				}

				throw caught;
			}

			// add images to db
			const newPhoto: typeof photos.$inferInsert = {
				id,
				uploadedById: ctx.session.user.id,
				collectionId: collection?.id,
				takenAt: new Date(input.image.lastModified),
				url: `https://s3.${env.AWS_S3_REGION}.amazonaws.com/${env.AWS_S3_BUCKET_NAME}/${id}`,
				width,
				height,
				thumbnailUrl: `https://s3.${env.AWS_S3_REGION}.amazonaws.com/${env.AWS_S3_BUCKET_NAME}/${thumbnailKey}`,
				thumbnailWidth,
				thumbnailHeight,
			};

			const exif = await exifr.parse(image, {
				pick: [
					"DateTimeOriginal",
					"FNumber",
					"ExposureTime",
					"Model",
					"LensModel",
					"ISO",
					"FocalLength",
				],
			});

			ctx.db.transaction(async (tx) => {
				if (exif) {
					const camera = await insertOrSelectCamera(tx, exif.Model);
					const lens = await insertOrSelectLens(tx, exif.LensModel);

					if (exif.DateTimeOriginal) newPhoto.takenAt = exif.DateTimeOriginal;
					newPhoto.aperture = exif.FNumber;
					newPhoto.shutterSpeed = exif.ExposureTime;
					newPhoto.cameraId = camera?.id;
					newPhoto.lensId = lens?.id;
					newPhoto.isoSpeed = exif.ISO;
					newPhoto.focalLength = exif.FocalLength;
				}

				await tx.insert(photos).values(newPhoto);
			});
		}),

	count: publicProcedure.input(filterInput).query(async ({ ctx, input }) => {
		const filters: SQL[] = [];
		if (input.collection)
			filters.push(eq(photos.collectionId, input.collection));
		if (input.camera) filters.push(eq(photos.cameraId, input.camera));
		if (input.lens) filters.push(eq(photos.lensId, input.lens));
		if (input.date?.from && input.date?.to) {
			filters.push(
				gte(photos.takenAt, input.date.from),
				lte(
					photos.takenAt,
					new Date(input.date.to.getTime() + 60 * 60 * 24 * 1000),
				),
			);
		}

		return await ctx.db.$count(photos, and(...filters));
	}),

	searchPaginated: publicProcedure
		.input(
			filterInput.extend({
				pageSize: z.number().min(10).max(50).default(50),
				page: z.number().default(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			const filters: SQL[] = [];
			if (input.collection)
				filters.push(eq(photos.collectionId, input.collection));
			if (input.camera) filters.push(eq(photos.cameraId, input.camera));
			if (input.lens) filters.push(eq(photos.lensId, input.lens));
			if (input.date?.from && input.date?.to) {
				filters.push(
					gte(photos.takenAt, input.date.from),
					lte(
						photos.takenAt,
						new Date(input.date.to.getTime() + 60 * 60 * 24 * 1000),
					),
				);
			}

			return await ctx.db
				.select({
					...getTableColumns(photos),
					cameraName: cameras.name,
					lensName: lenses.name,
				})
				.from(photos)
				.where(and(...filters))
				.orderBy(desc(photos.takenAt))
				.limit(input.pageSize)
				.offset(input.pageSize * (input.page - 1))
				.leftJoin(cameras, eq(photos.cameraId, cameras.id))
				.leftJoin(lenses, eq(photos.lensId, lenses.id));
		}),

	byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
		return await ctx.db.query.photos.findFirst({
			where: eq(photos.id, input),
		});
	}),

	getLatestInCollection: publicProcedure
		.input(
			z.object({
				collectionId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const latestPhoto = await ctx.db
				.select({ url: photos.url })
				.from(photos)
				.where(eq(photos.collectionId, input.collectionId))
				.orderBy(desc(photos.takenAt))
				.limit(1);

			return latestPhoto[0]?.url;
		}),

	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const deleted = await ctx.db
				.delete(photos)
				.where(eq(photos.id, input))
				.returning();

			if (deleted[0]) {
				await deletePhoto(deleted[0].id);
			}
		}),

	edit: protectedProcedure
		.input(editPhotoSchema)
		.mutation(async ({ ctx, input }) => {
			const collectionId =
				input.collection === "" ? null : Number.parseInt(input.collection, 10);

			await ctx.db
				.update(photos)
				.set({ collectionId })
				.where(eq(photos.id, input.id));
		}),
});

import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3ServiceException,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import exifr from "exifr";
import sharp from "sharp";
import { z } from "zod";
import { env } from "~/env";
import s3Client from "~/lib/s3";
import { editPhotoSchema, importPhotoSchema } from "~/lib/schemas";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
	cameras,
	lenses,
	photos,
	photosToTags,
	tags,
} from "~/server/db/schema";

async function insertOrSelectLens(
	model: string,
): Promise<typeof lenses.$inferInsert | undefined> {
	if (!model) return;
	const insertedLens = await db
		.insert(lenses)
		.values({
			name: model,
		})
		.onConflictDoNothing()
		.returning();

	if (insertedLens.length > 0) {
		return insertedLens[0];
	}

	return await db.query.lenses.findFirst({
		where: (lenses, { eq }) => eq(lenses.name, model),
	});
}

async function insertOrSelectCamera(
	serial: number,
	model: string,
): Promise<typeof cameras.$inferInsert | undefined> {
	if (!serial) return;
	const insertedCamera = await db
		.insert(cameras)
		.values({
			serial,
			name: model,
		})
		.onConflictDoNothing()
		.returning();

	if (insertedCamera.length > 0) {
		return insertedCamera[0];
	}

	return await db.query.cameras.findFirst({
		where: (cameras, { eq }) => eq(cameras.serial, serial),
	});
}

export const photoRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z
				.instanceof(FormData)
				.transform((fd) => Object.fromEntries(fd.entries()))
				.transform((obj) => ({
					...obj,
					tags: obj.tags ? JSON.parse(obj.tags.toString()) : [],
				}))
				.pipe(importPhotoSchema),
		)
		.mutation(async ({ ctx, input }) => {
			const image = await input.image.arrayBuffer();

			const collectionId = input.collection
				? Number.parseInt(input.collection)
				: null;

			const collection = collectionId
				? await ctx.db.query.collections.findFirst({
						where: (collections, { eq }) => eq(collections.id, collectionId),
					})
				: null;

			const id = crypto.randomUUID();
			const thumbnailKey = `${id}-thumb`;

			// process images
			const optimised = await sharp(image)
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
				})
				.toBuffer();

			const thumbnail = sharp(optimised)
				.resize({
					width: 720,
					height: 720,
					fit: "inside",
				})
				.toFormat("webp", {
					quality: 60,
					effort: 2,
				});

			const { width: thumbnailWidth, height: thumbnailHeight } =
				await thumbnail.metadata();

			// add images to db
			const newPhoto: typeof photos.$inferInsert = {
				id,
				uploadedById: ctx.session.user.id,
				collectionId: collection?.id,
				takenAt: new Date(input.image.lastModified),
				url: `https://s3.${env.AWS_S3_REGION}.amazonaws.com/${env.AWS_S3_BUCKET_NAME}/${id}`,
				thumbnailUrl: `https://s3.${env.AWS_S3_REGION}.amazonaws.com/${env.AWS_S3_BUCKET_NAME}/${thumbnailKey}`,
				thumbnailWidth,
				thumbnailHeight,
			};

			const exif = await exifr.parse(image, {
				pick: [
					"DateTimeOriginal",
					"FNumber",
					"ExposureTime",
					"SerialNumber",
					"Model",
					"LensModel",
					"ISO",
					"FocalLength",
				],
			});

			if (exif) {
				const camera = await insertOrSelectCamera(
					exif.SerialNumber,
					exif.Model,
				);
				const lens = await insertOrSelectLens(exif.LensModel);

				if (exif.DateTimeOriginal) newPhoto.takenAt = exif.DateTimeOriginal;
				newPhoto.aperture = exif.FNumber;
				newPhoto.shutterSpeed = exif.ExposureTime;
				newPhoto.cameraId = camera?.id;
				newPhoto.lensId = lens?.id;
				newPhoto.isoSpeed = exif.ISO;
				newPhoto.focalLength = exif.FocalLength;
			}

			await ctx.db.transaction(async (tx) => {
				await tx.insert(photos).values(newPhoto);

				if (input.tags.length > 0) {
					await tx.insert(photosToTags).values(
						input.tags.map((tagId) => ({
							photoId: id,
							tagId,
						})),
					);
				}
			});

			// upload images
			try {
				await s3Client.send(
					new PutObjectCommand({
						Bucket: env.AWS_S3_BUCKET_NAME,
						Key: id,
						Body: optimised,
					}),
				);
				await s3Client.send(
					new PutObjectCommand({
						Bucket: env.AWS_S3_BUCKET_NAME,
						Key: thumbnailKey,
						Body: await thumbnail.toBuffer(),
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
		}),

	search: publicProcedure
		.input(
			z.object({
				tags: z.array(z.number()),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (input.tags.length === 0 || input.tags[0] === 0) {
				return await ctx.db.select().from(photos).orderBy(desc(photos.takenAt));
			}

			return await ctx.db
				.select({
					...getTableColumns(photos),
					count: sql<number>`cast(count(${tags.id}) as int)`,
				})
				.from(photos)
				.innerJoin(photosToTags, eq(photos.id, photosToTags.photoId))
				.innerJoin(tags, eq(photosToTags.tagId, tags.id))
				.where(inArray(tags.id, input.tags))
				.having(({ count }) => eq(count, input.tags.length))
				.groupBy(photos.id)
				.orderBy(desc(photos.takenAt));
		}),

	withTags: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return await ctx.db.query.photos.findFirst({
				where: eq(photos.id, input),
				with: {
					photosToTags: true,
				},
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
			const thumbnailKey = `${input}-thumb`;

			try {
				await s3Client.send(
					new DeleteObjectCommand({
						Bucket: env.AWS_S3_BUCKET_NAME,
						Key: input,
					}),
				);
				await s3Client.send(
					new DeleteObjectCommand({
						Bucket: env.AWS_S3_BUCKET_NAME,
						Key: thumbnailKey,
					}),
				);
			} catch (caught) {
				if (caught instanceof Error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: caught.message,
					});
				}

				throw caught;
			}

			await ctx.db.delete(photos).where(eq(photos.id, input));
		}),

	edit: protectedProcedure
		.input(editPhotoSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.transaction(async (tx) => {
				const collectionId =
					input.collection === "" ? null : Number.parseInt(input.collection);

				await tx
					.update(photos)
					.set({
						collectionId,
					})
					.where(eq(photos.id, input.id));

				const existingTags = await tx
					.select({ tagId: photosToTags.tagId })
					.from(photosToTags)
					.where(eq(photosToTags.photoId, input.id));
				const existingTagIds = existingTags.map((t) => t.tagId);
				const tagsUnchanged =
					existingTagIds.length === input.tags.length &&
					existingTagIds.every((id) => input.tags.includes(id));

				if (!tagsUnchanged) {
					await tx
						.delete(photosToTags)
						.where(eq(photosToTags.photoId, input.id));

					if (input.tags.length > 0) {
						await tx.insert(photosToTags).values(
							input.tags.map((tagId) => ({
								photoId: input.id,
								tagId,
							})),
						);
					}
				}
			});
		}),
});

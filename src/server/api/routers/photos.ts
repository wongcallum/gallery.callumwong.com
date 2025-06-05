import { desc, eq } from "drizzle-orm";
import exifr from "exifr";
import { z } from "zod";
import { env } from "~/env";
import { importPhotoSchema } from "~/lib/schemas";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { cameras, lenses, photos, photosToTags } from "~/server/db/schema";

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
				? await db.query.collections.findFirst({
						where: (collections, { eq }) => eq(collections.id, collectionId),
					})
				: null;

			const id = crypto.randomUUID();
			const newPhoto: typeof photos.$inferInsert = {
				id,
				uploadedById: ctx.session.user.id,
				collectionId: collection?.id,
				takenAt: new Date(input.image.lastModified),
				url: `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_S3_REGION}.amazonaws.com/${id}`,
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

			await db.transaction(async (tx) => {
				await tx.insert(photos).values(newPhoto);

				for (const tag of input.tags) {
					await tx.insert(photosToTags).values({
						photoId: id,
						tagId: Number.parseInt(tag),
					});
				}
			});

			// const command = new PutObjectCommand({
			// 	Bucket: env.AWS_S3_BUCKET_NAME,
			// 	Key: id,
			// 	Body: image as Buffer,
			// });
			//
			// try {
			// 	const response = await s3Client.send(command);
			// } catch (caught) {
			// 	if (
			// 		caught instanceof S3ServiceException &&
			// 		caught.name === "EntityTooLarge"
			// 	) {
			// 		throw new TRPCError({
			// 			code: "PAYLOAD_TOO_LARGE",
			// 			message: "Uploaded file is too large!",
			// 		});
			// 	}

			// 	if (caught instanceof Error) {
			// 		throw new TRPCError({
			// 			code: "INTERNAL_SERVER_ERROR",
			// 			message: caught.message,
			// 		});
			// 	}

			// 	throw caught;
			// }
		}),
	getLatestInCollection: publicProcedure
		.input(
			z.object({
				collectionId: z.number(),
			}),
		)
		.query(async ({ input }) => {
			const latestPhoto = await db
				.select({ url: photos.url })
				.from(photos)
				.where(eq(photos.collectionId, input.collectionId))
				.orderBy(desc(photos.takenAt))
				.limit(1);

			return latestPhoto[0]?.url;
		}),
});

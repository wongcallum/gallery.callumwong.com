import { paginateListBuckets } from "@aws-sdk/client-s3";
import exifr from "exifr";
import { z } from "zod";
import { env } from "~/env";
import s3Client from "~/lib/s3";
import { importPhotoSchema } from "~/lib/schemas";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { cameras, lenses, photos } from "~/server/db/schema";

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
				url: `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_S3_REGION}.amazonaws.com/${id}`,
				collectionId: collection?.id,
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

				newPhoto.takenAt = exif.DateTimeOriginal || input.image.lastModified;
				newPhoto.aperture = exif.FNumber;
				newPhoto.shutterSpeed = exif.ExposureTime;
				newPhoto.camera = camera?.id;
				newPhoto.lens = lens?.id;
				newPhoto.isoSpeed = exif.ISO;
				newPhoto.focalLength = exif.FocalLength;
			}

			await db.insert(photos).values(newPhoto);

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
	list: publicProcedure.query(async ({ ctx }) => {
		// const command = new ListObjectsCommand({
		// 	Bucket: env.AWS_S3_BUCKET_NAME,
		// });
		// const { Contents } = await s3Client.send(command);

		const buckets = [];

		for await (const page of paginateListBuckets({ client: s3Client }, {})) {
			if (page.Buckets) {
				buckets.push(...page.Buckets);
			}
		}
		console.log("Buckets: ");
		console.log(buckets.map((bucket) => bucket.Name).join("\n"));

		// const contentsList = Contents?.map((c) => ` • ${c.Key}`).join("\n");
		// console.log("\nHere's a list of files in the bucket:");
		// console.log(`${contentsList}\n`);
	}),
});

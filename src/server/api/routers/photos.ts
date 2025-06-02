import {
	PutObjectCommand,
	S3ServiceException,
	paginateListBuckets,
} from "@aws-sdk/client-s3";
import { z } from "zod";
import { env } from "~/env";
import s3Client from "~/lib/s3";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

export const photoRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.instanceof(FormData))
		.mutation(async ({ ctx, input }) => {
			const images = input.getAll("images") as File[];

			const command = new PutObjectCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Key: "test",
				Body: (await images[0]?.arrayBuffer()) as Buffer,
			});

			try {
				const response = await s3Client.send(command);
				console.log(response);
			} catch (caught) {
				if (
					caught instanceof S3ServiceException &&
					caught.name === "EntityTooLarge"
				) {
					console.error(
						`Error from S3 while uploading object. \
			The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
			or the multipart upload API (5TB max).`,
					);
				} else if (caught instanceof S3ServiceException) {
					console.error(
						`Error from S3 while uploading object.  ${caught.name}: ${caught.message}`,
					);
				} else {
					throw caught;
				}
			}
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

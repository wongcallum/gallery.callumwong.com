import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

const s3Client = new S3Client({
	region: env.AWS_S3_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
});

export default s3Client;

export async function deletePhoto(id: string) {
	const thumbnailKey = `${id}-thumb`;

	try {
		await s3Client.send(
			new DeleteObjectCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Key: id,
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
}

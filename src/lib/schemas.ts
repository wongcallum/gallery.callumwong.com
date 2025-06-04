import { z } from "zod";

export const importPhotoSchema = z.object({
	exif: z.coerce.boolean(),
	collection: z.string().optional(),
	tags: z.string().optional(),
	image: z.custom<File>(),
});

export const createCollectionSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	location: z.string().optional(),
});

import { z } from "zod";

export const importPhotoSchema = z.object({
	exif: z.coerce.boolean(),
	collection: z.string(),
	tags: z.array(z.string()),
	image: z.custom<File>(),
});

export const createCollectionSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	location: z.string().optional(),
});

export const createTagSchema = z.object({
	name: z.string().min(1),
});

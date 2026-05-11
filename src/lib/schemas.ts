import { z } from "zod";

export const importPhotoSchema = z.object({
	exif: z.boolean(),
	collection: z.string(),
	image: z.custom<File>(),
});

export const createCollectionSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	priority: z.number(),
	thumbnailPhotoURL: z.string().nullish(),
});

export const editPhotoSchema = z.object({
	id: z.string(),
	collection: z.string(),
});

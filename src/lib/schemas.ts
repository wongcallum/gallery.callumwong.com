import { z } from "zod";

export const importPhotoSchema = z.object({
	exif: z.boolean(),
	collection: z.string(),
	tags: z.array(z.number()),
	image: z.custom<File>(),
});

export const createCollectionSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	priority: z.number(),
});

export const createTagSchema = z.object({
	name: z.string().min(1),
});

export const editPhotoSchema = z.object({
	id: z.string(),
	collection: z.string(),
	tags: z.array(z.number()),
});

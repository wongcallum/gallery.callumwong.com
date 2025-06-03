import { z } from "zod";

export const importPhotoSchema = z.object({
	exif: z.boolean(),
	collection: z.string(),
	tags: z.string(),
	images: z.custom<File>(),
});

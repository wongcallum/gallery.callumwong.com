import { z } from "zod";

export const importPhotoSchema = z.object({
	exif: z.coerce.boolean(),
	collection: z.string(),
	tags: z.string(),
	image: z.custom<File>(),
});

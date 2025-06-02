import { z } from "zod";

export const importFormSchema = z.object({
	exif: z.boolean(),
	collection: z.string(),
	tags: z.string(),
	images: z.array(
		z.object({
			value: z.custom<File>(),
		}),
		{ message: "Please upload at least one image." },
	),
});

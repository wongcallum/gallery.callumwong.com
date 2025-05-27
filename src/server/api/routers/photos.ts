import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const photoRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z
				.instanceof(FormData)
				.transform((fd) => Object.fromEntries(fd.entries()))
				.pipe(
					z.object({
						file: z.instanceof(File).refine((f) => f.size > 0),
						exif: z.boolean(),
						collection: z.number(),
						tags: z.array(z.string()),
					}),
				),
		)
		.mutation(async ({ ctx, input }) => {
			console.log(input);
		}),
});

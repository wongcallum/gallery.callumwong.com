import { count, eq } from "drizzle-orm";
import { createTagSchema } from "~/lib/schemas";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { photosToTags, tags } from "~/server/db/schema";

export const tagsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createTagSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(tags).values({
				name: input.name,
			});
		}),

	all: publicProcedure.query(async ({ ctx, input }) => {
		const allTags = await ctx.db
			.select({
				id: tags.id,
				name: tags.name,
				photoCount: count(photosToTags.photoId),
			})
			.from(tags)
			.leftJoin(photosToTags, eq(tags.id, photosToTags.tagId))
			.groupBy(tags.id);

		return allTags;
	}),
});

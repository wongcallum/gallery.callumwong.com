import { count, eq, like } from "drizzle-orm";
import { z } from "zod";
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

	withCount: publicProcedure.query(async ({ ctx }) => {
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

	search: publicProcedure
		.input(
			z
				.object({
					searchString: z.string(),
				})
				.optional(),
		)
		.mutation(async ({ ctx, input }) => {
			if (!input?.searchString) {
				return await ctx.db.query.tags.findMany();
			}

			return await ctx.db.query.tags.findMany({
				where: like(tags.name, `%${input.searchString}%`),
			});
		}),
});

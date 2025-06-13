import { count, eq, ilike } from "drizzle-orm";
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

	modify: protectedProcedure
		.input(
			createTagSchema.extend({
				id: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(tags)
				.set({
					name: input.name,
				})
				.where(eq(tags.id, input.id));
		}),

	delete: protectedProcedure
		.input(z.number())
		.mutation(async ({ ctx, input }) => {
			await ctx.db.transaction(async (tx) => {
				await tx.delete(tags).where(eq(tags.id, input));
			});
		}),

	all: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.tags.findMany();
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
			z.object({
				searchString: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const term = input.searchString;
			return await ctx.db
				.select()
				.from(tags)
				.where(term ? ilike(tags.name, `%${term}%`) : undefined);
		}),
});

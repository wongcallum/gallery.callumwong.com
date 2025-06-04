import { collectionRouter } from "~/server/api/routers/collections";
import { photoRouter } from "~/server/api/routers/photos";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { filterRouter } from "./routers/filter";
import { tagsRouter as tagRouter } from "./routers/tags";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	filter: filterRouter,
	collections: collectionRouter,
	photos: photoRouter,
	tags: tagRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

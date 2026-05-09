import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					console.log(`Sign in attempt by ${user.email}`);
					if (!env.ADMIN_EMAIL.includes(user.email)) {
						throw new APIError("FORBIDDEN", {
							message: "Email not authorized",
						});
					}
					return { data: user };
				},
			},
		},
	},
	plugins: [nextCookies()],
});

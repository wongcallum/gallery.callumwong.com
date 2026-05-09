import { defineConfig } from "drizzle-kit";

import { env } from "~/env";

// pnpm drizzle-kit push --force --config drizzle.empty.config.ts

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/server/db/empty-schema.ts",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});

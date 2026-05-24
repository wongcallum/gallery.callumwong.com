export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") return;

	const { drizzle } = await import("drizzle-orm/postgres-js");
	const { migrate } = await import("drizzle-orm/postgres-js/migrator");
	const postgres = (await import("postgres")).default;
	const { env } = await import("~/env");

	const client = postgres(env.DATABASE_URL, { max: 1 });
	try {
		await migrate(drizzle(client), { migrationsFolder: "drizzle" });
	} finally {
		await client.end();
	}
}

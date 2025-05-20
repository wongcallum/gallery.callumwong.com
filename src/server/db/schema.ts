import { relations, sql } from "drizzle-orm";
import { index, primaryKey, sqliteTableCreator } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
	(name) => `gallery.callumwong.com_${name}`,
);

export const collections = createTable("collection", (d) => ({
	id: d.integer().primaryKey({ autoIncrement: true }),
	createdById: d
		.text({ length: 255 })
		.notNull()
		.references(() => users.id),
	name: d.text().notNull(),
	description: d.text().notNull(),
	thumbnailPhotoURL: d.text(),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [collections.createdById],
		references: [users.id],
	}),
	thumbnailPhoto: one(photos, {
		fields: [collections.thumbnailPhotoURL],
		references: [photos.url],
	}),
	photos: many(photos),
}));

export const photos = createTable(
	"photo",
	(d) => ({
		id: d.text().primaryKey(),
		collectionId: d.integer().references(() => collections.id),
		uploadedById: d
			.text({ length: 255 })
			.notNull()
			.references(() => users.id),
		takenAt: d
			.integer({ mode: "timestamp" })
			// .default(sql`(unixepoch())`)
			.notNull(),
		aperture: d.real(),
		shutterSpeed: d.real(),
		focalLength: d.integer(),
		isoSpeed: d.integer(),
		title: d.text({ length: 256 }),
		url: d.text({ length: 2048 }).notNull(),
	}),
	(t) => [
		index("uploaded_by_idx").on(t.uploadedById),
		index("collection_idx").on(t.collectionId),
	],
);

export const photosRelations = relations(photos, ({ one, many }) => ({
	collection: one(collections, {
		fields: [photos.collectionId],
		references: [collections.id],
	}),
	photosToTags: many(photosToTags),
}));

export const tags = createTable("tag", (d) => ({
	id: d.text({ length: 256 }).unique().primaryKey(),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	photosToTags: many(photosToTags),
}));

export const photosToTags = createTable(
	"photos_to_tags",
	(d) => ({
		photoId: d
			.text()
			.notNull()
			.references(() => photos.id),
		tagId: d
			.text({ length: 256 })
			.notNull()
			.references(() => tags.id),
	}),
	(t) => [primaryKey({ columns: [t.photoId, t.tagId] })],
);

export const photosToTagsRelations = relations(photosToTags, ({ one }) => ({
	tag: one(tags, {
		fields: [photosToTags.tagId],
		references: [tags.id],
	}),
	photo: one(photos, {
		fields: [photosToTags.photoId],
		references: [photos.id],
	}),
}));

export const users = createTable("user", (d) => ({
	id: d
		.text({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.text({ length: 255 }),
	email: d.text({ length: 255 }).notNull(),
	emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
	image: d.text({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.text({ length: 255 })
			.notNull()
			.references(() => users.id),
		type: d.text({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.text({ length: 255 }).notNull(),
		providerAccountId: d.text({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.text({ length: 255 }),
		scope: d.text({ length: 255 }),
		id_token: d.text(),
		session_state: d.text({ length: 255 }),
	}),
	(t) => [
		primaryKey({
			columns: [t.provider, t.providerAccountId],
		}),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d.text({ length: 255 }).notNull().primaryKey(),
		userId: d
			.text({ length: 255 })
			.notNull()
			.references(() => users.id),
		expires: d.integer({ mode: "timestamp" }).notNull(),
	}),
	(t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.text({ length: 255 }).notNull(),
		token: d.text({ length: 255 }).notNull(),
		expires: d.integer({ mode: "timestamp" }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

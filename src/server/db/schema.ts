import { relations } from "drizzle-orm";
import { pgTable as createTable, index, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const collections = createTable("collection", (d) => ({
	id: d.serial().primaryKey(),
	createdById: d
		.text()
		.notNull()
		.references(() => user.id),
	name: d.text().notNull(),
	description: d.text().default("").notNull(),
	thumbnailPhotoURL: d.text(),
	createdAt: d.timestamp().defaultNow().notNull(),
	lastUpdatedAt: d
		.timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	priority: d.integer().default(0).notNull(),
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
			.text()
			.notNull()
			.references(() => users.id),
		createdAt: d.timestamp().defaultNow().notNull(),
		lastUpdatedAt: d
			.timestamp()
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		takenAt: d.timestamp(),
		aperture: d.real(),
		shutterSpeed: d.real(),
		focalLength: d.real(),
		isoSpeed: d.integer(),
		cameraId: d.integer().references(() => cameras.id),
		lensId: d.integer().references(() => lenses.id),
		title: d.text(),
		url: d.text().notNull(),
		width: d.integer().notNull(),
		height: d.integer().notNull(),
		thumbnailUrl: d.text().notNull(),
		thumbnailWidth: d.integer().notNull(),
		thumbnailHeight: d.integer().notNull(),
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
	camera: one(cameras, {
		fields: [photos.cameraId],
		references: [cameras.id],
	}),
	lens: one(lenses, {
		fields: [photos.lensId],
		references: [lenses.id],
	}),
}));

export const cameras = createTable("camera", (d) => ({
	id: d.serial().primaryKey(),
	// serial: d.integer().unique().notNull(),
	name: d.text().notNull().unique(),
}));

export const lenses = createTable("lens", (d) => ({
	id: d.serial().primaryKey(),
	// serial: d.integer().unique().notNull(),
	name: d.text().notNull().unique(),
}));

export const tags = createTable("tag", (d) => ({
	id: d.serial().primaryKey(),
	name: d.text().unique().notNull(),
	createdAt: d.timestamp().defaultNow().notNull(),
	lastUpdatedAt: d
		.timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
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
			.references(() => photos.id, {
				onDelete: "cascade",
			}),
		tagId: d
			.integer()
			.notNull()
			.references(() => tags.id, {
				onDelete: "cascade",
			}),
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
		.text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.text(),
	email: d.text().notNull(),
	emailVerified: d.timestamp().defaultNow(),
	image: d.text(),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.text()
			.notNull()
			.references(() => users.id),
		type: d.text().$type<AdapterAccount["type"]>().notNull(),
		provider: d.text().notNull(),
		providerAccountId: d.text().notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.text(),
		scope: d.text(),
		id_token: d.text(),
		session_state: d.text(),
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
		sessionToken: d.text().notNull().primaryKey(),
		userId: d
			.text()
			.notNull()
			.references(() => users.id),
		expires: d.timestamp().notNull(),
	}),
	(t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.text().notNull(),
		token: d.text().notNull(),
		expires: d.timestamp().notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

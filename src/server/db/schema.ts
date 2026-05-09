import { relations } from "drizzle-orm";
import { pgTable as createTable, index, primaryKey } from "drizzle-orm/pg-core";

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
	createdBy: one(user, {
		fields: [collections.createdById],
		references: [user.id],
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
			.references(() => user.id),
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

export const user = createTable("user", (d) => ({
	id: d
		.text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.text().notNull(),
	email: d.text().notNull(),
	emailVerified: d.boolean().notNull().default(false),
	image: d.text(),
	createdAt: d.timestamp().notNull().defaultNow(),
	updatedAt: d.timestamp().notNull().defaultNow(),
}));

export const userRelations = relations(user, ({ many }) => ({
	account: many(account),
	session: many(session),
}));

export const account = createTable(
	"account",
	(d) => ({
		id: d
			.text()
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: d
			.text()
			.notNull()
			.references(() => user.id),
		accountId: d.text().notNull(),
		providerId: d.text().notNull(),
		accessToken: d.text(),
		refreshToken: d.text(),
		accessTokenExpiresAt: d.timestamp(),
		refreshTokenExpiresAt: d.timestamp(),
		scope: d.text(),
		idToken: d.text(),
		password: d.text(),
		createdAt: d.timestamp().notNull().defaultNow(),
		updatedAt: d.timestamp().notNull().defaultNow(),
	}),
	(t) => [index("account_user_id_idx").on(t.userId)],
);

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const session = createTable(
	"session",
	(d) => ({
		id: d
			.text()
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: d
			.text()
			.notNull()
			.references(() => user.id),
		token: d.text().notNull().unique(),
		expiresAt: d.timestamp().notNull(),
		ipAddress: d.text(),
		userAgent: d.text(),
		createdAt: d.timestamp().notNull().defaultNow(),
		updatedAt: d.timestamp().notNull().defaultNow(),
	}),
	(t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const verification = createTable("verification", (d) => ({
	id: d
		.text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	identifier: d.text().notNull(),
	value: d.text().notNull(),
	expiresAt: d.timestamp().notNull(),
	createdAt: d.timestamp().notNull().defaultNow(),
	updatedAt: d.timestamp().notNull().defaultNow(),
}));

ALTER TABLE "collection" ADD COLUMN "slug" text;--> statement-breakpoint
-- basic backfill for existing collections
UPDATE "collection" SET "slug" = lower(replace("name", ' ', '-')) WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_slug_unique" UNIQUE("slug");
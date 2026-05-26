ALTER TABLE "collection" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_slug_unique" UNIQUE("slug");
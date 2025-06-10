CREATE TABLE "gallery.callumwong.com_account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "gallery.callumwong.com_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_camera" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "gallery.callumwong.com_camera_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_collection" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdById" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"thumbnailPhotoURL" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUpdatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_lens" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "gallery.callumwong.com_lens_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_photo" (
	"id" text PRIMARY KEY NOT NULL,
	"collectionId" integer,
	"uploadedById" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUpdatedAt" timestamp DEFAULT now() NOT NULL,
	"takenAt" timestamp,
	"aperture" real,
	"shutterSpeed" real,
	"focalLength" real,
	"isoSpeed" integer,
	"cameraId" integer,
	"lensId" integer,
	"title" text,
	"url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"thumbnailUrl" text NOT NULL,
	"thumbnailWidth" integer NOT NULL,
	"thumbnailHeight" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_photos_to_tags" (
	"photoId" text NOT NULL,
	"tagId" integer NOT NULL,
	CONSTRAINT "gallery.callumwong.com_photos_to_tags_photoId_tagId_pk" PRIMARY KEY("photoId","tagId")
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUpdatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery.callumwong.com_tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp DEFAULT now(),
	"image" text
);
--> statement-breakpoint
CREATE TABLE "gallery.callumwong.com_verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "gallery.callumwong.com_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_account" ADD CONSTRAINT "gallery.callumwong.com_account_userId_gallery.callumwong.com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."gallery.callumwong.com_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_collection" ADD CONSTRAINT "gallery.callumwong.com_collection_createdById_gallery.callumwong.com_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."gallery.callumwong.com_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_photo" ADD CONSTRAINT "gallery.callumwong.com_photo_collectionId_gallery.callumwong.com_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."gallery.callumwong.com_collection"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_photo" ADD CONSTRAINT "gallery.callumwong.com_photo_uploadedById_gallery.callumwong.com_user_id_fk" FOREIGN KEY ("uploadedById") REFERENCES "public"."gallery.callumwong.com_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_photo" ADD CONSTRAINT "gallery.callumwong.com_photo_cameraId_gallery.callumwong.com_camera_id_fk" FOREIGN KEY ("cameraId") REFERENCES "public"."gallery.callumwong.com_camera"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_photo" ADD CONSTRAINT "gallery.callumwong.com_photo_lensId_gallery.callumwong.com_lens_id_fk" FOREIGN KEY ("lensId") REFERENCES "public"."gallery.callumwong.com_lens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_photos_to_tags" ADD CONSTRAINT "gallery.callumwong.com_photos_to_tags_photoId_gallery.callumwong.com_photo_id_fk" FOREIGN KEY ("photoId") REFERENCES "public"."gallery.callumwong.com_photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_photos_to_tags" ADD CONSTRAINT "gallery.callumwong.com_photos_to_tags_tagId_gallery.callumwong.com_tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."gallery.callumwong.com_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery.callumwong.com_session" ADD CONSTRAINT "gallery.callumwong.com_session_userId_gallery.callumwong.com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."gallery.callumwong.com_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "gallery.callumwong.com_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "uploaded_by_idx" ON "gallery.callumwong.com_photo" USING btree ("uploadedById");--> statement-breakpoint
CREATE INDEX "collection_idx" ON "gallery.callumwong.com_photo" USING btree ("collectionId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "gallery.callumwong.com_session" USING btree ("userId");
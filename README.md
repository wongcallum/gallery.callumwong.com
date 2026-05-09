# gallery.callumwong.com

Personal gallery project

## Features

- Photos belong to only one collection
- Photos can have many tags
- EXIF metadata extraction
- Filtering by tags
- Filtering by metadata

## Stack

- Next.js 16
- Tailwind CSS + shadcn
- tRPC + TanStack Query
- Postgres + Drizzle ORM
- S3 storage
- Better Auth (SSO)

## Run

```sh
pnpm i
cp .env.example .env
pnpm db:push
pnpm dev
```


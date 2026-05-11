# gallery.callumwong.com

Personal gallery project

## Features

- Photos belong to a collection
- EXIF metadata extraction

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


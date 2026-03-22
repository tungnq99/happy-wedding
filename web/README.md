# Happy Wedding Web (Option 2 Stack)

MVP implementation for:
- Public wedding invitation landing page by slug
- Admin dashboard for couples/staff
- RSVP and wishes collection
- Neon Postgres + Prisma
- Clerk auth
- Cloudinary signed upload API (preferred) or Cloudflare R2 fallback

## Stack

- Next.js 16 (App Router)
- React 19
- Prisma ORM
- Neon Postgres
- Clerk
- Cloudinary (preferred)
- Cloudflare R2 (optional fallback, S3 compatible)

## Project Structure

- `app/admin` admin pages and server actions
- `app/[slug]` public landing page
- `app/api/rsvp` RSVP API
- `app/api/wishes` wishes API
- `app/api/upload-url` signed upload URL API (Cloudinary/R2)
- `lib/prisma.ts` Prisma singleton
- `lib/r2.ts` R2 signed URL helper
- `prisma/schema.prisma` database schema
- `proxy.ts` route protection with Clerk

## Environment

Copy `.env.example` to `.env` and fill values:

Required:
- `DATABASE_URL` from Neon
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_SIGN_IN_FORCE_REDIRECT_URL=/admin`
- `CLERK_SIGN_UP_FORCE_REDIRECT_URL=/admin`

Upload provider (recommended):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional fallback provider (if not using Cloudinary):
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_URL`

## Run

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open:
- `http://localhost:3000` home
- `http://localhost:3000/admin` admin
- `http://localhost:3000/<wedding-slug>` invitation page

## Notes

- Admin and `/api/upload-url` are protected by Clerk in `proxy.ts`.
- RSVP and wishes APIs are public for guests.
- `/api/upload-url` auto-uses Cloudinary when `CLOUDINARY_*` is set; otherwise it falls back to R2.
- For production, use a CDN/custom domain for image delivery.

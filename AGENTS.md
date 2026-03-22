# Repository Guidelines

## Project Structure & Module Organization
- Main application lives in `web/` (Next.js App Router, fullstack style).
- UI routes and server pages are under `web/app/`.
  - Public invitation page: `web/app/[slug]/page.tsx`
  - Demo page: `web/app/demo/page.tsx`
  - Admin pages: `web/app/admin/*`
  - API routes: `web/app/api/*/route.ts`
- Shared logic is in `web/lib/` (e.g., `prisma.ts`, `r2.ts`, `slug.ts`).
- Database schema is in `web/prisma/schema.prisma`.
- Static assets are in `web/public/`.

## Build, Test, and Development Commands
Run commands from `web/`:
- `npm run dev` - start local development server.
- `npm run build` - production build.
- `npm run start` - run built app.
- `npm run lint` - run ESLint.
- `npm run prisma:generate` - generate Prisma client.
- `npm run prisma:migrate` - apply local DB migrations.
- `npm run prisma:studio` - inspect DB with Prisma Studio.

## Coding Style & Naming Conventions
- Language: TypeScript with React function components.
- Indentation: 2 spaces; keep imports grouped and sorted logically.
- File naming:
  - Route files: `page.tsx`, `layout.tsx`, `route.ts`
  - Helpers: lowercase in `web/lib/*`.
- Use Tailwind utility classes for styling; avoid inline styles unless dynamic.
- Run `npm run lint` before committing.

## Testing Guidelines
- No formal test suite is configured yet.
- Minimum quality gate: `npm run lint` and a successful local build.
- When adding tests, prefer colocated `*.test.ts(x)` files or `web/tests/` for integration cases.

## Commit & Pull Request Guidelines
- Follow Conventional Commits where possible:
  - `feat(admin): add event delete action`
  - `fix(landing): allow unsplash image host`
- PRs should include:
  - Clear summary and scope
  - Screenshots/GIFs for UI changes
  - Notes on env/config changes (`.env`, Prisma migrations)
  - Linked issue/ticket if available

## Security & Configuration Tips
- Never commit secrets. Use `web/.env` locally and keep `.env.example` updated.
- Validate ownership checks for admin actions (`ownerClerkId`) when touching server actions.
- For external images, update `web/next.config.ts` `images.remotePatterns`.
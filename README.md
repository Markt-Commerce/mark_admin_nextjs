# Markt admin console

The staff console for Markt: seller verification, customer account management and shop oversight. It's a Next.js 16 (App Router) app that talks to the Markt Flask API at `/api/v1/admin`.

## Run it locally

1. **Start the backend.** Use `markt_python` on the `feature/admin-console-support` branch, with its migrations applied. See that repo's README for the database and Redis it needs.
2. **Seed test staff accounts.** This is for a local database only:
   ```bash
   cd ../markt_python
   .venv/bin/python ../markt-admin/scripts/seed_dev_backend.py
   ```
   It creates one account per staff role (`super@markt.test`, `support@markt.test` and so on) and prints the password.
3. **Configure and start the console:**
   ```bash
   cp .env.example .env.local   # set MARKT_API_URL if the API isn't on 127.0.0.1:8000
   npm install
   npm run dev
   ```
4. Open http://localhost:3000 and sign in with a seeded staff account.

## How it's put together

- **Auth.** The Next.js server signs staff in through `POST /admin/auth/login` and keeps the bearer token in an httpOnly cookie. The browser never sees the token, and every API call is made from the server (`src/lib/dal.ts`).
- **Permissions.** Menus and buttons are gated with `can()` and `<Can>` (`src/lib/permissions.ts`, `src/lib/me-context.tsx`), using the `permissions` array from `/admin/me`. They never use the role name.
- **Design system.** Tokens live in `src/app/globals.css`, components in `src/components/ui`, and patterns in `src/components/patterns`. Run the dev server and open `/design-system` to browse them. That route is development only.
- **Mutations.** These are Server Actions next to each page (`actions.ts`). Each one returns the API's fresh record, and the page re-renders from it.

## Docs

- `docs/PHASE_0_AUDIT.md`: the audit and the owner's decisions.
- `docs/BUILD_NOTES.md`: what each phase built, what it uses, and what was flagged.
- `docs/BACKEND_CHANGES.md`: backend changes, written for the backend team.

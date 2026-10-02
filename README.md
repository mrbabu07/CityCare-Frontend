# CityCare Frontend

Next.js App Router frontend for the CityCare complaint and service-request backend. This is the first working implementation, not a final assignment submission.

## Run locally

1. Install dependencies with `npm install`.
2. Set the values listed in `.env.example` in `.env.local`. Demo credentials remain server-side. The current workspace already has a configured, ignored `.env.local`.
3. Run `npm run dev` and open http://localhost:3000. Use `npx next dev -p 3001` if that port is occupied.

## Architecture

- Server Components own page routes, metadata, and authenticated role layouts.
- `src/proxy.ts` performs an initial session-cookie check. Each role layout verifies the user through the backend and redirects users who belong to another role.
- `src/app/api/auth/[action]/route.ts` handles login, registration, demo login and logout. Access and refresh tokens are held in HTTP-only cookies, never localStorage or client JSON responses.
- `src/app/api/backend/[...path]/route.ts` forwards authenticated requests to the fixed backend URL. Mutations require a same-origin request. The backend remains authoritative for resource ownership and permissions.
- TanStack Query manages server data and invalidation. Context owns the mobile navigation state. Role edits use optimistic updates with rollback.
- React Hook Form and Zod validate mutation forms. Radix Dialog provides accessible modals and the mobile drawer. Recharts is loaded only on dashboards.
- Search, status filtering and request pagination use URL parameters. Audit and payment pagination also use URL state.

## Working screens

Public home, about, services, contact/support and FAQ; login and registration; separate Citizen, Staff and Admin workspaces; request lists/details; citizen request wizard and payments; profile editing; admin department/category CRUD, people/roles and activity logs.

Complaint details support status updates, staff assignment, feedback after resolution, Cloudinary uploads with progress, and priority-payment initiation. All operational data comes from the backend. New demo accounts can legitimately have empty request lists.

## Checks

```sh
npm run lint
npm run typecheck
npm run format:check
npm run build
```

The development server has been checked with desktop/mobile browser views and the real backend. These checks do not constitute complete end-to-end coverage of all mutations.

## Remaining assignment work

- Add Google sign-in to the frontend and verify it against the configured OAuth client.
- Automatic session restoration and refresh-token rotation are implemented. Run `node tests/auth.integration.mjs` for isolated auth-route regression checks. Verify multi-tab refresh in the deployed browser environment as well.
- Restore active SSLCommerz sandbox credentials. The last backend checkout test returned `Store Credential Error Or Store is De-active`.
- Coordinate backend payment callbacks with frontend success/cancel pages. Current callbacks return backend JSON, so the full frontend payment return journey is not complete.
- Finish comprehensive end-to-end tests for all roles, attachments, payment outcomes, and responsive form states.
- Deploy the published frontend repository to Vercel with server environment variables and verify the production URL.
- Continue meaningful development commits toward the assignment's 20-commit requirement. No artificial commits are created to inflate the count.
- Record the walkthrough video and complete the submission template.

The backend URL is configured independently of the frontend. No backend secrets or Cloudinary keys are needed in the browser.

## Media

City skyline photograph from [Unsplash](https://images.unsplash.com/photo-1477959858617-67f85cf4f1df), stored locally as `public/city.jpg` and rendered with Next Image. It is general city imagery, not a claim about the deployment's location.

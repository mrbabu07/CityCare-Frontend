# Frontend deployment

## Keep the two repositories separate

Import `mrbabu07/CityCare-Frontend` into Vercel as a new Next.js project. Use repository root (`.`), not `citycare-frontend/`: that folder name exists only in the current local backend workspace. Never deploy the backend project as the frontend or stage the nested frontend directory in backend Git.

Use Node.js 24.x, install `npm ci`, build `npm run build`, and the default Next.js output settings. The backend and frontend need separate Vercel projects and environment variables.

## Frontend server environment

Configure the following for Production (and Preview only when those demo accounts are appropriate for previews):

| Variable              | Value/source                                      |
| --------------------- | ------------------------------------------------- |
| BACKEND_API_URL       | `https://city-care-backend.vercel.app/api/v1`     |
| DEMO_ADMIN_EMAIL      | Dedicated admin demo email from `.env.local`      |
| DEMO_ADMIN_PASSWORD   | Dedicated admin demo password from `.env.local`   |
| DEMO_CITIZEN_EMAIL    | Dedicated citizen demo email from `.env.local`    |
| DEMO_CITIZEN_PASSWORD | Dedicated citizen demo password from `.env.local` |
| DEMO_STAFF_EMAIL      | Dedicated staff demo email from `.env.local`      |
| DEMO_STAFF_PASSWORD   | Dedicated staff demo password from `.env.local`   |

Do not prefix these with `NEXT_PUBLIC_`. Do not upload `.env.local`, Cloudinary secrets, database credentials or gateway credentials to the frontend repository. Vercel environment changes apply to a new deployment, so redeploy after changing them. See [Vercel environment documentation](https://vercel.com/docs/environment-variables/managing-environment-variables).

## Backend coordination

- `FRONTEND_URL`: exact deployed frontend origin, without a page path.
- `BACKEND_URL`: exact deployed backend origin.
- `CORS_ORIGIN`: comma-separated allowed frontend origins, no trailing slash or wildcard.
- Active SSLCommerz sandbox store credentials, `SSLCOMMERZ_IS_LIVE=false`.
- Deploy the Day 4 callback and Day 5 gateway-CORS changes. Without those deployed changes, the local frontend cannot repair hosted backend callbacks.

Browser API requests go through the same-origin Next.js proxy; server-to-server calls do not need browser CORS. Gateway callbacks still verify payment signatures/validation independently of CORS. See [Express CORS documentation](https://expressjs.com/en/resources/middleware/cors/).

## Release checks

```powershell
npm run release:check
npm test
npm run lint
npm run format:check
npm run build
npm run smoke -- https://YOUR-FRONTEND.vercel.app
```

The smoke script renders public pages, authenticates each configured demo role, reads real data, tests access restrictions, and logs out. It creates/revokes login sessions but does not modify requests, profiles or payments. It fails on deployment protection or missing demo credentials rather than bypassing protection.

Complete real sandbox payment success/cancellation/failure, uploads, optimistic rollback and responsive workspace testing manually before submission. Do not count unit tests as a successful gateway payment.

Day 2 through Day 5 source changes have been pushed as of October 5, 2026. No manual deployment was performed during publication; any automatic deployment triggered by Git pushes still needs verification.

# Day 4: workflows and payment returns

## Implemented

- Existing React Hook Form + Zod wizard now retains its values and step across workspace navigation in user-scoped Context. It clears on successful submission, logout or account change. It intentionally stays in memory, not localStorage; a full reload discards the draft.
- Existing sidebar Context and optimistic role changes remain. Complaint status now updates optimistically and rolls back if the backend rejects the transition, then refetches authoritative data.
- Cloudinary attachments continue through the authenticated backend. Uploads now have a timeout and retry once after access-token refresh, retaining progress and file validation.
- `/payment/result` displays only the protected API's recorded payment state. URL outcome alone never confirms payment. Pending payments have bounded automatic polling and manual refresh.
- Backend browser callbacks use 303 redirects to a configured frontend after verification. Invalid callbacks lead to an unverified page, never to a paid claim. IPN remains server-to-server JSON. Without `FRONTEND_URL`, existing JSON callback behavior remains.
- Transaction IDs fit SSLCommerz's documented 30-character limit. See [provider documentation](https://developer.sslcommerz.com/doc/v4/index.html).
- Evidence images have responsive `sizes`. Dashboard charts already load dynamically; public pages do not import the chart component.
- Run `node scripts/audit-bundle.mjs` after building for raw/gzip chunk sizes. These are per-chunk measurements, not a claim about a route's total initial transfer.

Measured production output during this change: 30 JavaScript chunks; largest chunk about 350 KiB raw / 100 KiB gzip. No additional frontend dependency was added for these workflows.

## Deployment requirements and remaining verification

Set `FRONTEND_URL` on the BACKEND to the deployed frontend origin (local example: `http://localhost:3008`). Deploy the backend callback changes as well as the frontend. Keep `BACKEND_URL` set to the reachable backend and configure gateway IPN as required by the provider. Credentials stay on the backend.

Real sandbox checkout remains blocked until active SSLCommerz sandbox store credentials are configured. No payment success or production deployment is claimed. Test successful, cancelled and failed checkout plus delayed IPN with real sandbox credentials after deployment.

Frontend build, lint and list/payment-state tests passed. Backend tests cover callback redirects and transaction ID length. The unverified return page was checked at desktop and 390px mobile width with no horizontal overflow. Browser logging returned generic `Object` errors (including an extension-origin error), so a clean hydration audit cannot be claimed yet. Full browser checks of draft restoration, optimistic rollback and authenticated upload retry remain necessary.

## Publication status

Published on October 4, 2026, with a separate push after each feature commit:

- Frontend `4e65ccd`: request draft persistence.
- Frontend `6c8081d`: optimistic status changes and resilient uploads with tests.
- Frontend `e20ab56`: verified payment result view and polling with tests.
- Backend `1397c6c`: provider-compatible transaction IDs with regression coverage.
- Backend `536e0b4`: trusted frontend callback redirects and tests.

The bundle-audit script and this guide are published in the accompanying documentation/tooling commit. The six frontend payment/upload tests and all sixteen backend regression tests passed before publication. The backend test run also included the still-local Day 5 CORS test.

Day 5 work remains uncommitted and unpushed. Publishing source does not verify deployment or real sandbox payments; the deployment requirements above still apply.

## Historical staging reference

Day 2, Day 3 and Day 4 are now published. The original staging commands below are retained only as a file-scope reference; do not repeat the earlier-day snapshot staging commands.

Original Day 4 frontend file group:

```powershell
git add -- src/components/new-request.tsx src/components/request-detail.tsx src/components/workspace-shell.tsx src/components/request-draft.tsx src/components/payment-result.tsx src/lib/payment-result.ts src/lib/upload.ts "src/app/(public)/payment/result/page.tsx" tests/payment-result.test.mjs tests/upload.test.mjs scripts/audit-bundle.mjs docs/day-4.md
git diff --cached --stat
git commit -m "feat: add persistent request drafts and verified payment returns"
```

Backend changes belong to its separate repository: `.env.example`, `src/controllers/payment.controller.ts`, `src/services/payment.service.ts`, `src/utils/paymentReturn.ts`, `tests/payment-return.test.js`, `tests/payment.test.js`. Do not stage the nested frontend folder into the backend repository.

```powershell
# Frontend checks
node --experimental-strip-types --test tests/list-state.test.mjs tests/payment-result.test.mjs
node --test tests/upload.test.mjs
npm run lint
npm run build
node scripts/audit-bundle.mjs
# Backend checks, from the backend directory
npm test
```

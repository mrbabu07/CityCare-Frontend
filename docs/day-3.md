# Day 3: API views and dashboards

## Implementation

- TanStack Query fetches real backend data and shows global query/mutation error toasts.
- Request lists use backend search, status filtering and pagination.
- People, departments and categories use URL-synchronized search and pagination. People also supports role filtering. These endpoints return complete arrays, so these three views filter/page locally rather than pretending the backend supports server pagination.
- Forms and request details retain existing create/update/archive workflows and cache invalidation.
- Data errors provide retry controls. Empty states differ from failures. Payment lookup errors are not presented as unpaid.
- Dashboard charts distinguish loading, errors, empty data and actual results.
- Existing route loading skeletons and error boundaries remain in place.

## Published changes

Day 2 was pushed on October 2, 2026. Day 3 code was pushed on October 3, 2026, with a separate push after each feature commit:

- `87953e2`: URL-state controls, reusable retry UI and regression tests.
- `d2b3cfc`: Searchable, paginated admin management and people views.
- `8122151`: Request list, creation and detail recovery states.
- `4933b63`: Dashboard loading, error and empty chart states.
- `60a9ea5`: Payment and activity history error/pagination recovery.

Only the Day 3 snapshots of `new-request.tsx` and `request-detail.tsx` were committed. Their Day 4 changes remain in the working tree. Day 4/5 work was not pushed.

## Historical staging reference

The commands below document the original separation procedure. Day 2 and Day 3 are already published; do not rerun these staging commands or overwrite the newer versions of shared files. Continue with Day 4's guide when its publication is requested.

Day 2 files (commit these first):

```powershell
git add -- README.md src/app/api/auth src/app/session src/lib/api.ts src/lib/server.ts src/lib/session.ts src/lib/refresh.ts src/proxy.ts tests/auth.integration.mjs
git diff --cached --stat
git commit -m "feat: restore expired sessions and test authentication"
```

Day 3 files (commit after Day 2):

```powershell
git add -- src/components/list-controls.tsx src/components/ui.tsx src/components/management.tsx src/components/requests.tsx src/components/overview.tsx src/components/payments.tsx src/components/reports.tsx src/lib/list-state.ts tests/list-state.test.mjs docs/day-3.md
git update-index --cacheinfo 100644,9ec691f6934b6ae5dc3d9c86fcef79b82acd9f01,src/components/new-request.tsx
git update-index --cacheinfo 100644,13482e3a646dc1c33359daf54a82b2009382509d,src/components/request-detail.tsx
git diff --cached --stat
git commit -m "feat: complete data-view filtering pagination and recovery states"
```

The original implementation was left uncommitted until publication was requested. These historical commands run from the frontend folder. Avoid `git add .` while later days still have uncommitted work.

The two `update-index` commands stage locally preserved Day 3 snapshots without changing the working files, which now also contain Day 4 work. These object IDs are specific to this existing local repository. Do not run them in a new clone. After committing Day 3, the Day 4 edits to these two files will remain unstaged.

## Verification

```powershell
node --experimental-strip-types --test tests/list-state.test.mjs
node tests/auth.integration.mjs
npm run lint
npm run build
```

Production deployment and live payment testing remain separate assignment tasks.

Verified during this change: production build, ESLint, formatting check and all three list-state tests passed. The live-backend Staff dashboard empty state rendered correctly. Browser automation repeatedly detached when activating Admin demo login, including in a fresh tab, so admin filter interactions, mutation journeys and mobile visual checks still need browser verification. The Day 2 auth suite was not rerun during this change; its code was left untouched.

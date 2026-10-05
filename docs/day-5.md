# Day 5 release status

## Completed locally

- Responsive public navigation added, long workspace text wraps, reduced-motion preference respected.
- Screenshots verified desktop login, 390px phone login, 320px phone home and 768px tablet home. Fixed the narrow-phone header overflow; measured document width equals scroll width on the checked phone/tablet views. This does not imply every authenticated screen has passed visual QA.
- Security headers added and local nested-repository Turbopack root set explicitly.
- Read-only real-backend smoke script passes public pages, all three demo logins, role layouts, permissions, data reads and logout.
- Frontend unit tests (9) and backend regression tests (16) pass. No fake gateway payment was substituted.
- Release check confirms ignored secrets and configured local demo variables, without printing values.
- CI workflow, deployment guide, exact submission template and video recording outline added.

## Still required before claiming completion

- Deploy latest frontend and backend changes; configure environment variables; run smoke against the real production frontend URL.
- Active SSLCommerz sandbox credentials and actual success/cancel/failure checkout tests.
- Finish authenticated browser mutation testing and hydration checks. Browser screenshots/DOM reads work, but interactions repeatedly detach in the available browser connection.
- Review meaningful Git history before submission. The frontend now exceeds 20 commits; this count does not replace the remaining deployment, payment and video requirements.
- Record the 5-10 minute video, verify public viewing, fill submission URL/password placeholders privately and submit before the actual course deadline.

## Publication status

Day 5 changes were published on October 5, 2026, with a separate push after each commit:

- Frontend `5254f21`: mobile navigation, narrow layouts and reduced motion.
- Frontend `6bea855`: security headers and frontend build root.
- Frontend `ae2a12e`: CI, release checks and smoke tooling.
- Backend `e3cb4e0`: gateway callback CORS handling and regression coverage.

Deployment/submission/video guides are included in the accompanying documentation commit. Nine frontend tests, sixteen backend tests and frontend lint passed before publication. Hosted CI and deployment outcomes have not been verified by this publication step.

## Historical file scope

The commands below are retained as a file-scope reference. Day 2 through Day 5 are now published; do not repeat earlier snapshot-staging instructions.

Day 5 frontend files:

```powershell
git add -- .github/workflows/ci.yml next.config.ts package.json src/components/public-layout.tsx src/app/globals.css scripts/smoke.mjs scripts/release-check.mjs docs/deployment.md docs/submission.txt docs/video-walkthrough.md docs/day-5.md
git diff --cached --stat
git commit -m "chore: prepare release checks deployment and submission"
```

Backend Day 5 changes are `src/app.ts` and `tests/app.test.js`; commit them in the backend repository, separately from Day 4 payment changes. Do not add the nested frontend folder to backend Git.

Source publication is complete. Actual deployment and the remaining release gates above must still be verified separately.

# Testing Guidelines

This document defines the testing standards for this repository, referenced by [CLAUDE.md](../CLAUDE.md) as the single source of truth for testing practices.

Current stack: Next.js 16 (App Router), React 19, TypeScript (strict), ESLint, Vitest + React Testing Library (installed — see "Adoption status" below).

---

## 1) Philosophy

- Tests exist to protect business correctness and prevent regressions — not to hit a coverage number.
- Write the smallest test that proves the behavior. Prefer a few meaningful tests over many trivial ones.
- A test that never fails when the code is wrong is worse than no test — assert on behavior, not implementation details.
- Test public behavior (what a user or caller observes), not internals.

## 2) Test types and tools

| Type | Purpose | Tool | When required |
|---|---|---|---|
| Unit | Pure functions, business logic, utilities | [Vitest](https://vitest.dev/) | Any non-trivial logic (branching, calculations, data transforms) |
| Component | React component rendering, interaction, accessibility | Vitest + [React Testing Library](https://testing-library.com/react) | Any component with logic beyond pure markup (conditional rendering, state, form handling, event handlers) |
| Integration | Multiple units/components working together (e.g. a form + validation + submit) | Vitest + RTL | Flows that touch several components or a component + API call |
| End-to-end | Full user flow in a real browser | [Playwright](https://playwright.dev/) | Critical user paths only (e.g. sign-up, checkout, payment) — introduced once such flows exist |

Rationale: Vitest is chosen over Jest for its native ESM/TypeScript support, speed, and low-config integration with the Next.js/Vite ecosystem — see ADR entry. React Testing Library is chosen over shallow-rendering tools because it tests components the way users interact with them, which better protects business correctness.

Do not introduce a second tool for the same job (e.g. no Jest alongside Vitest, no Cypress alongside Playwright) without an ADR entry justifying the change.

## 3) Directory and naming conventions

- Co-locate tests with the code they test: `frontend/src/app/foo/page.tsx` → `frontend/src/app/foo/page.test.tsx`, `api/src/routes.ts` → `api/src/routes.test.ts`.
- Use `*.test.ts` / `*.test.tsx` for unit and component tests.
- Use `e2e/*.spec.ts` at the repo root for Playwright end-to-end tests.
- Test file names mirror the file under test; no generic `test.ts` / `index.test.ts`.

## 4) What must be tested

- All business logic (pricing, eligibility, calculations, validation rules).
- All conditional rendering and user-facing state changes in components.
- Error paths and edge cases (empty state, invalid input, failed request) — not just the happy path.
- Bug fixes: every fixed bug gets a regression test that fails before the fix and passes after.

## 5) What does not need a dedicated test

- Trivial pass-through components with no logic (pure JSX wrappers).
- Third-party library internals — trust their own test suites.
- Next.js framework wiring itself (routing, layout composition) unless it carries custom logic.

## 6) Mocking

- Mock at system boundaries only (network calls, external services, time, randomness).
- Do not mock what you own and can test directly (e.g. don't mock a sibling pure function — call it).
- Prefer realistic fixtures over deeply nested mock objects.

## 7) Coverage

- No arbitrary global coverage percentage is enforced. Coverage is a signal, not a target.
- A pull request must not decrease coverage on the files it touches without an explicit, stated reason.

## 8) CI

- `npm test` (once configured) must run in CI on every pull request and block merge on failure, alongside `npm run lint` and `npm run build`.
- E2E tests run in CI on a separate, slower job (or on-demand) once introduced, so they don't block fast feedback on every push.

## 9) Definition of Done (testing part)

A change is not done until:
- New/changed business logic has unit or component tests covering the happy path and at least one edge case.
- `npm run lint`, `npm run build`, and `npm test` all pass locally.
- No test was skipped, commented out, or weakened to make CI pass.

## 10) Anti-patterns to avoid

- Snapshot tests as a substitute for behavioral assertions.
- Testing implementation details (internal state, private functions, CSS class names) instead of observable behavior.
- Flaky tests tolerated via retries instead of fixed at the root cause.
- One giant end-to-end test covering everything instead of focused unit/component tests plus a few critical-path e2e tests.

---

## Adoption status

Installed (2026-09-21, see ADR log):
- `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` as dev dependencies.
- `vitest.config.mts` (jsdom environment, native tsconfig paths resolution) and `vitest.setup.ts` (loads `@testing-library/jest-dom/vitest` matchers).
- `npm test` (single run, for CI) and `npm run test:watch` (local dev) scripts.

Not yet installed: Playwright for e2e — deferred until a real critical user flow exists to justify it.

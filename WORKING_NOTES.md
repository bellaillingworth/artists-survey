# Working Notes — Favorite Artist Survey

> **INTERNAL DOCUMENT — NOT PUBLIC FACING.**
> This file is for the developer and any AI assistants working on this project.
> Update this file at the end of every working session.

---

## How to Use This File (For AI Assistants)

1. **Read this entire file first** before doing anything — it contains decisions, known issues, and rejected approaches that will affect your work.
2. **Read `README.md`** for public-facing context: features, tech stack, and setup instructions.
3. **Do not change folder structure or naming conventions** without discussing it with the developer first.
4. **Follow all conventions exactly** as described in the Conventions section — do not introduce new patterns.
5. **Do not suggest anything listed in "What Was Tried and Rejected"** — those paths were considered and ruled out deliberately.
6. **Ask before making large structural changes** — this includes moving files, renaming packages, changing the OpenAPI spec without regenerating codegen, or altering the monorepo layout.
7. **Refactor conservatively** — this project was partially built with AI assistance. When modifying existing code, prefer targeted edits over rewrites. Do not clean up or "improve" code that is not directly related to the task at hand.
8. **Do not regenerate codegen files without checking** — `lib/api-client-react/src/generated/api.ts` has a manual fix applied (see Known Issues). Running `pnpm --filter @workspace/api-spec run codegen` will overwrite it and reintroduce the bug.

---

## Current State

**Last Updated:** 2026-03-30

The app is fully functional on Replit and has been published to a `.replit.app` domain. All four survey questions work, responses are stored in PostgreSQL, and the results page renders all five Recharts visualizations correctly. The project is being prepared for deployment to **Azure Static Web Apps** — that work is partially complete.

### What Is Working
- [x] Home page with navigation to survey and results
- [x] Four-question survey form with full validation and inline error messages
- [x] Conditional "Other" platform text input with auto-focus
- [x] Thank-you confirmation screen after successful submission
- [x] `POST /api/survey/responses` — inserts response into PostgreSQL
- [x] `GET /api/survey/results` — returns aggregated, normalized data
- [x] Results page with all five Recharts visualizations
- [x] Case normalization on artist and platform names before aggregation
- [x] Footer: "Survey by Bella, BAIS:3300 - spring 2026."
- [x] `staticwebapp.config.json` added to `public/` for SPA routing on Azure

### What Is Partially Built
- [ ] Azure deployment: `staticwebapp.config.json` is in place but build settings, environment variables, and backend strategy have not been configured in Azure portal
- [ ] The "Privacy" and "Terms" links in the footer are `#` placeholders — no policy pages exist

### What Is Not Started
- [ ] Azure backend strategy — choosing between Azure Functions, a separate Express server, or Supabase direct (see Open Questions)
- [ ] Duplicate submission prevention (one response per student)
- [ ] CSV export for instructor download
- [ ] Rate limiting on the POST endpoint

---

## Current Task

Working on Azure Static Web Apps deployment preparation. The `staticwebapp.config.json` routing file has been added. The next decision is which backend strategy to use on Azure since the current Express server cannot run inside SWA. The developer has been presented with three options (A/B/C) and has not yet chosen one.

**Single next step:** Developer decides on backend strategy (Azure Functions, separate App Service, or Supabase direct), then implement accordingly.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 | Component model, ecosystem, required by scaffold |
| Vite | 7 | Fast HMR, first-class TypeScript and Tailwind support |
| TypeScript | 5.9 | Full-stack type safety; shared types via OpenAPI codegen |
| Wouter | 3.3 | Lightweight client-side router; no React Router overhead |
| React Hook Form | 7 | Performant form state, native Zod integration via resolvers |
| Zod | 3 | Schema validation shared between frontend and backend |
| Recharts | 2 | Composable React charts; simpler API than D3 for bar charts |
| Framer Motion | latest | Page transition animations |
| Tailwind CSS | v4 | Utility-first styling; v4 config-less setup used |
| Express | 5 | Minimal HTTP server for API routes |
| Drizzle ORM | latest | Type-safe SQL; schema-first with `drizzle-zod` integration |
| PostgreSQL | 16 | Relational store for survey responses |
| Orval | 8.5 | OpenAPI-to-TypeScript codegen; generates React Query hooks and Zod schemas |
| pnpm Workspaces | 10 | Monorepo management; shared libs under `lib/`, apps under `artifacts/` |

---

## Project Structure Notes

```
.
├── artifacts/
│   ├── api-server/              # Express 5 REST API — runs on PORT env var
│   │   └── src/
│   │       ├── app.ts           # CORS, JSON parsing, pino-http middleware, route mounting
│   │       ├── index.ts         # Reads PORT, starts server
│   │       └── routes/
│   │           ├── index.ts     # Mounts health + survey routers under /api
│   │           ├── health.ts    # GET /api/healthz
│   │           └── survey.ts    # POST /api/survey/responses, GET /api/survey/results
│   └── artist-survey/           # React + Vite SPA
│       ├── public/
│       │   └── staticwebapp.config.json  # Azure SWA SPA routing fallback
│       └── src/
│           ├── App.tsx          # QueryClient, wouter Router, base path wiring
│           ├── index.css        # Tailwind v4 theme; CSS custom properties for colors
│           ├── components/
│           │   ├── Layout.tsx   # Header nav + footer (footer has student name here)
│           │   └── ui/Button.tsx
│           ├── hooks/
│           │   └── use-survey.ts  # Thin wrappers over generated API hooks
│           └── pages/
│               ├── Home.tsx
│               ├── Survey.tsx   # Form + thank-you screen (single component, conditional render)
│               └── Results.tsx  # All five charts in one component
├── lib/
│   ├── api-spec/
│   │   ├── openapi.yaml         # ⚠️ Source of truth — edit here, then run codegen
│   │   └── orval.config.ts      # Generates into api-client-react and api-zod
│   ├── api-client-react/
│   │   └── src/generated/api.ts # ⚠️ Has a manual URL fix — do not overwrite with codegen
│   ├── api-zod/                 # Generated Zod schemas — do not edit manually
│   └── db/
│       └── src/schema/
│           └── survey.ts        # survey_responses table + insert schema
├── README.md                    # Public-facing documentation
├── WORKING_NOTES.md             # This file
└── staticwebapp.config.json     # ← Does NOT exist here; it lives in artifacts/artist-survey/public/
```

### Non-Obvious Decisions

- **`platforms` is stored as a JSON string**, not a PostgreSQL array. Drizzle's `pgTable` was used with `text()` and `JSON.stringify()` on insert. This was chosen to avoid schema complexity; parsing happens in the route handler at read time.
- **`BASE_PATH` env var is required at Vite build time** (line 30 of `vite.config.ts`). It is set automatically by Replit. On Azure, it must be added as an application setting before the build runs. The value should be `/`.
- **Build output is `dist/public`**, not the Vite default `dist`. Set in `vite.config.ts` line 58. Azure SWA's output location must reflect this.
- **The wouter `<Router>` uses `import.meta.env.BASE_URL`** as its base, which Vite injects from the `base` config. This is why all links use relative paths (`/survey`, `/results`) rather than absolute URLs.

### Files/Folders That Must Not Be Changed Without Discussion

- `lib/api-spec/openapi.yaml` — changing this requires re-running codegen AND manually re-applying the URL fix in `api-client-react/src/generated/api.ts`
- `lib/api-client-react/src/generated/api.ts` — contains a manual fix; see Known Issues
- `lib/db/src/schema/survey.ts` — any column changes require a `pnpm --filter @workspace/db run push` and may affect existing data
- `artifacts/artist-survey/vite.config.ts` — `outDir` and `base` settings are load-bearing for routing and Azure deployment

---

## Data / Database

### Table: `survey_responses`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `SERIAL` (integer) | Auto | Primary key, auto-incremented |
| `favorite_artist` | `TEXT` | Yes | Raw user input; normalized (title case) at query time, not on insert |
| `genre` | `TEXT` | Yes | One of the 12 dropdown values |
| `college_year` | `TEXT` | Yes | One of: `1st Year`, `2nd Year`, `3rd Year`, `4th Year`, `5th Year or More` |
| `platforms` | `TEXT` | Yes | JSON stringified array, e.g. `["Spotify","YouTube"]` |
| `other_platform` | `TEXT` | No | Populated only when `"Other"` is in `platforms`; user free text |
| `created_at` | `TIMESTAMPTZ` | Auto | Defaults to `NOW()` on insert |

No other tables exist. No joins are performed. All aggregation is done in JavaScript in the route handler after a full table scan (`db.select().from(surveyResponsesTable)`).

---

## Conventions

### Naming Conventions

- Workspace packages use the `@workspace/` prefix (e.g. `@workspace/api-server`, `@workspace/artist-survey`)
- Package directories use kebab-case (`artist-survey`, `api-server`)
- Database table names use snake_case (`survey_responses`)
- TypeScript types use PascalCase; Zod schemas use PascalCase suffixed with the schema type (e.g. `SubmitSurveyBody`, `GetSurveyResultsResponse`)
- React components use PascalCase filenames; hooks use `use-` kebab-case filenames

### Code Style

- TypeScript strict mode throughout
- `"type": "module"` in all package.json files
- No `console.log` in server code — use `req.log` (pino-http) inside route handlers; use the singleton `logger` from `lib/logger.ts` for non-request code
- Imports use `@/` alias for `artifacts/artist-survey/src/`
- All server responses are validated with Zod schemas from `@workspace/api-zod`

### Framework Patterns

- **OpenAPI-first**: all API changes start in `lib/api-spec/openapi.yaml`, then codegen, then implement
- **Route handlers in `artifacts/api-server/src/routes/`**: one file per resource, mounted in `routes/index.ts`
- **Form pages**: validation is handled by `react-hook-form` + `@hookform/resolvers/zod`; the Zod schema lives in the page component file
- **Results page**: all aggregation happens server-side in the route handler; the frontend only renders what the API returns

### Git Commit Style

Conventional Commits format:
```
feat: add CSV export for instructor download
fix: correct getSurveyResults URL in generated API client
chore: update staticwebapp.config.json for Azure routing
docs: update WORKING_NOTES with Azure deployment status
```

---

## Decisions and Tradeoffs

- **OpenAPI-first with Orval codegen:** All API contracts are defined in `openapi.yaml` and code is generated from it. This adds a codegen step but ensures the frontend and backend stay in sync by type. Do not suggest hand-writing fetch calls.
- **Express server instead of Azure Functions (for now):** The project was scaffolded with a shared Express backend and the developer has not yet chosen the Azure backend strategy. The Express server works on Replit. Do not refactor to Azure Functions without explicit instruction.
- **Full table scan for aggregation:** `GET /api/survey/results` fetches all rows and aggregates in JavaScript. This is acceptable for a class survey with dozens of responses. Do not suggest moving to SQL aggregation unless the dataset grows significantly.
- **`platforms` stored as JSON string:** Avoids `text[]` PostgreSQL array type complexity with Drizzle. Parsing overhead is negligible at this scale. Do not suggest changing the column type.
- **No authentication:** This is an intentional design decision. The survey is public and anonymous by design. Do not suggest adding auth unless the developer explicitly asks.
- **Replit built-in PostgreSQL instead of Supabase:** Despite Supabase credentials being stored, the backend uses Replit's PostgreSQL via `DATABASE_URL`. The Supabase credentials are present but not yet used by the app. See Open Questions.
- **`BASE_PATH` env var required at Vite build time:** Vite's `base` option is set from `process.env.BASE_PATH`. This means the app cannot be built without this variable set. On Azure, it must be explicitly added as `BASE_PATH=/`.

---

## What Was Tried and Rejected

- **Calling Supabase directly from the frontend (no Express backend):** Was discussed as Option C for Azure deployment. Not implemented — the Express backend was already built and working. Do not suggest switching to direct Supabase calls unless the developer explicitly chooses Option C.
- **Storing `platforms` as a PostgreSQL text array (`text[]`):** Would require Drizzle `text("platforms", { enum: [...] }).array()` and migration complexity. Rejected in favor of JSON string.
- **Using the OpenAPI spec's single `/survey/responses` path for both POST and GET:** Orval misassigned the GET URL to `/api/survey/responses` when both operations shared the same path. The fix was to split GET results into a separate `/survey/results` path. Do not merge them back.

---

## Known Issues and Workarounds

### Issue 1: Orval generated wrong URL for `getSurveyResults`

**Problem:** When the OpenAPI spec had both `POST /survey/responses` and `GET /survey/responses` on the same path, Orval's codegen set the `getGetSurveyResultsUrl()` function to return `/api/survey/responses` instead of `/api/survey/results`.

**Workaround:** The spec was updated to move GET results to a separate `/survey/results` path. Additionally, `lib/api-client-react/src/generated/api.ts` was manually patched on lines 204 and 218 to return `/api/survey/results`.

**Important:** Running `pnpm --filter @workspace/api-spec run codegen` will **overwrite** the patched file and reintroduce this bug. If codegen must be re-run, manually re-apply the fix afterwards, or verify that Orval now generates the correct URL.

### Issue 2: `vite.config.ts` throws if `PORT` or `BASE_PATH` are not set

**Problem:** The Vite config reads `process.env.PORT` and `process.env.BASE_PATH` at config load time and throws if either is missing. This means `vite build` will fail on CI/CD unless both are set.

**Workaround:** On Replit, both are injected automatically. On Azure, set `BASE_PATH=/` as an application setting. `PORT` is only needed for the dev server — the build command does not need it; the config should ideally guard `PORT` behind a dev-only check, but it has not been refactored yet. Do not remove the `BASE_PATH` logic.

---

## Browser / Environment Compatibility

### Frontend

- **Tested:** Chrome (latest), Safari (latest), Firefox (latest) via Replit preview
- **Expected support:** All modern browsers; no IE11 support required
- **Known incompatibilities:** `hsl(from ...)` relative color syntax used in `index.css` for automatic button border computation is not supported in Firefox < 128. The CSS includes explicit fallback lines immediately before each `hsl(from ...)` declaration — do not remove them.

### Backend

- **OS:** Linux (NixOS on Replit)
- **Node.js:** 24
- **Package manager:** pnpm 10 — do not use npm or yarn
- **Environment dependencies:** `DATABASE_URL`, `PORT`, `SESSION_SECRET` must be set. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are stored but not currently used by the running app.

---

## Open Questions

- **Which Azure backend strategy?** Three options were presented: (A) rewrite API as Azure Functions, (B) deploy Express server separately on Azure App Service, (C) remove Express and call Supabase directly from the browser. Developer has not yet decided. This choice gates all remaining Azure deployment work.
- **Should Supabase replace Replit PostgreSQL?** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are already stored as secrets. If Option C is chosen, Supabase becomes the database. If A or B, Azure Database for PostgreSQL is likely needed instead — or Supabase can be used as the hosted Postgres backend for the Express server.
- **Duplicate submission prevention?** The PRD does not specify it, but a class survey where one student can submit many times will skew results. Session tracking, a cookie, or a simple student ID field could address this.
- **Should `PORT` be guarded behind a dev-only check in `vite.config.ts`?** Currently the config throws on missing `PORT` even for `vite build`, which doesn't use a port. This could break Azure's build step if `PORT` is not set.

---

## Session Log

### 2026-03-30

**Accomplished:**
- Built the full Favorite Artist Survey app from scratch: home page, survey form (4 questions, validation, thank-you screen), results page with 5 Recharts visualizations
- Implemented Express API with `POST /api/survey/responses` and `GET /api/survey/results`
- Set up PostgreSQL schema with Drizzle ORM and pushed the `survey_responses` table
- Fixed Orval codegen bug (wrong URL generated for `getSurveyResults`) by patching the generated file and splitting the OpenAPI paths
- Replaced `[student]` footer placeholder with "Bella"
- Generated `README.md` with full public-facing documentation
- Added `staticwebapp.config.json` to `artifacts/artist-survey/public/` for Azure SWA SPA routing
- Provided analysis of all changes needed for Azure Static Web Apps deployment
- Confirmed Vite build output directory is `dist/public` (not default `dist`)
- Generated this `WORKING_NOTES.md`

**Left Incomplete:**
- Azure backend strategy not yet chosen or implemented
- `PORT` guard in `vite.config.ts` not yet fixed for build-only contexts
- "Privacy" and "Terms" footer links are still `#` placeholders

**Decisions Made:**
- Keep Express backend for now; defer Azure Functions rewrite until developer chooses a strategy
- `staticwebapp.config.json` belongs in `artifacts/artist-survey/public/`, not the project root

**Next Step:** Developer chooses Azure backend strategy (A, B, or C), then implement accordingly.

---

## Useful References

- [Azure Static Web Apps documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/) — SWA build configuration, managed functions, environment variables
- [Azure Static Web Apps — configuration reference](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration) — `staticwebapp.config.json` schema
- [Vite environment variables](https://vite.dev/guide/env-and-mode) — how `VITE_` prefix vars are baked in at build time
- [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview) — schema definition, `drizzle-kit push`, query builder
- [Orval documentation](https://orval.dev/guides/react-query) — React Query codegen from OpenAPI
- [Recharts documentation](https://recharts.org/en-US/api) — `BarChart`, `ResponsiveContainer`, `LabelList`
- [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/) — accessibility requirements followed throughout
- [Replit Agent](https://replit.com/) — used to scaffold, implement, debug, and document the full application in a single session

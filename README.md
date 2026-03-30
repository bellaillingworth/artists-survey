# Favorite Artist Survey

## Description

A full-stack web survey application built for undergraduate business students in BAIS:3300 (Spring 2026). It collects data about students' favorite musical artists, preferred genres, college year, and listening platforms, then presents the aggregated results as interactive charts. The app is designed to be accessible, mobile-friendly, and require zero login or authentication to participate.

## Badges

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## Features

- **Four-question survey** covering favorite artist, music genre, college year, and listening platforms — takes under a minute to complete
- **Conditional "Other" platform input** that appears automatically when "Other" is checked, with focus management for keyboard users
- **Inline validation** with clear error messages on every required field before submission
- **Thank-you confirmation screen** summarizing the user's answers immediately after submitting
- **Live results dashboard** with five Recharts visualizations: total responses, year-in-college bar chart, top 10 artists, genre breakdown with percentages, and listening platform counts
- **Case-normalized aggregation** so "taylor swift" and "Taylor Swift" are counted as the same entry
- **WCAG 2.1 Level AA accessibility** — all inputs are labeled, errors use `aria-describedby`, and everything is keyboard navigable
- **Fully responsive** single-column layout on mobile, expanding to a two-column grid on larger screens

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component framework |
| Vite 7 | Frontend dev server and build tool |
| TypeScript 5.9 | Static typing across the full stack |
| Wouter | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| React Hook Form | Form state management and validation |
| Zod | Schema validation on both client and server |
| Recharts | Interactive bar charts on the results page |
| Framer Motion | Page transition animations |
| Tailwind CSS v4 | Utility-first styling |
| Express 5 | Backend REST API server |
| Drizzle ORM | Type-safe database queries and schema management |
| PostgreSQL | Persistent storage for survey responses |
| Orval | OpenAPI-first code generation for API hooks and Zod schemas |
| pnpm Workspaces | Monorepo package management |

## Getting Started

### Prerequisites

- [Node.js 24+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/installation)
- A PostgreSQL database (connection string in `DATABASE_URL`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/artist-survey.git
   cd artist-survey
   ```

2. Install all workspace dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables — create a `.env` file in the project root (or set them in your environment):
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   SESSION_SECRET=your-random-secret
   ```

4. Push the database schema:
   ```bash
   pnpm --filter @workspace/db run push
   ```

5. (Optional) Regenerate API client code from the OpenAPI spec:
   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```

## Usage

### Development

Start the API server and frontend dev server in separate terminals:

```bash
# Terminal 1 — API server (runs on PORT assigned by environment)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — React frontend (Vite dev server)
pnpm --filter @workspace/artist-survey run dev
```

Then open `http://localhost:<PORT>/` in your browser.

### Routes

| Route | Description |
|---|---|
| `/` | Home page with navigation |
| `/survey` | The four-question survey form |
| `/results` | Aggregated results and charts |

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/survey/responses` | Submit a survey response |
| `GET` | `/api/survey/results` | Retrieve aggregated results |
| `GET` | `/api/healthz` | Server health check |

### Configuration

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for session signing |
| `PORT` | Port for the API server (auto-assigned in Replit) |

## Project Structure

```
.
├── artifacts/
│   ├── api-server/              # Express 5 REST API
│   │   └── src/
│   │       ├── app.ts           # Express app setup (CORS, middleware, routes)
│   │       ├── index.ts         # Server entry point — reads PORT, starts listening
│   │       └── routes/
│   │           ├── index.ts     # Mounts all sub-routers under /api
│   │           ├── health.ts    # GET /api/healthz — liveness check
│   │           └── survey.ts    # POST /responses and GET /results handlers
│   └── artist-survey/           # React + Vite frontend
│       └── src/
│           ├── App.tsx          # Root component with QueryClient and router
│           ├── index.css        # Tailwind v4 theme and CSS custom properties
│           ├── components/
│           │   ├── Layout.tsx   # Shared header, nav, footer wrapper
│           │   └── ui/
│           │       └── Button.tsx  # Reusable button with primary/outline variants
│           ├── hooks/
│           │   └── use-survey.ts   # Thin wrappers around generated API hooks
│           └── pages/
│               ├── Home.tsx     # Landing page with CTA buttons
│               ├── Survey.tsx   # Four-question form with validation and thank-you screen
│               └── Results.tsx  # Charts dashboard using Recharts
├── lib/
│   ├── api-spec/
│   │   ├── openapi.yaml         # Single source of truth for all API contracts
│   │   └── orval.config.ts      # Orval codegen config (React Query + Zod outputs)
│   ├── api-client-react/        # Generated React Query hooks (do not edit manually)
│   ├── api-zod/                 # Generated Zod request/response schemas
│   └── db/
│       ├── drizzle.config.ts    # Drizzle Kit config (reads DATABASE_URL)
│       └── src/
│           └── schema/
│               └── survey.ts    # survey_responses table definition and insert schema
├── pnpm-workspace.yaml          # Workspace package discovery and catalog pins
├── tsconfig.base.json           # Shared TypeScript compiler options
├── tsconfig.json                # Root solution file for composite lib packages
└── README.md                    # This file
```

## Changelog

### v1.0.0 — 2026-03-30

- Initial release
- Four-question survey form with full client-side validation
- Supabase-compatible PostgreSQL backend via Drizzle ORM
- Results page with five Recharts visualizations
- WCAG 2.1 AA accessibility compliance
- Fully responsive layout (mobile, tablet, desktop)
- OpenAPI-first architecture with generated React Query hooks and Zod schemas

## Known Issues / To-Do

- [ ] The "Privacy" and "Terms" links in the footer are placeholder `#` anchors — real policy pages have not been written yet
- [ ] The genre percentage labels on the horizontal bar chart can overlap when bar values are very close together
- [ ] No rate limiting is applied to the `POST /api/survey/responses` endpoint — repeated submissions from the same user are not currently prevented
- [ ] The results page polls on mount but does not auto-refresh; a manual "Refresh" button or polling interval would improve the live-class experience

## Roadmap

- **Duplicate submission prevention** — track submissions by session or device fingerprint so each student can only respond once
- **CSV / Excel export** of raw (anonymized) responses for instructor download
- **Word cloud visualization** for the favorite artist field to complement the bar chart
- **Dark mode support** — the CSS custom properties are structured for it; the `.dark` theme values just need to be filled in
- **Embeddable survey link** with a short URL or QR code for easy sharing in class

## Contributing

Contributions, bug reports, and suggestions are welcome. Please open an issue first to discuss what you'd like to change before submitting a pull request. All contributions should follow the existing code style (TypeScript strict mode, Tailwind for styling, Drizzle for any database changes).

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main` and describe what was changed and why

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software for personal, academic, or commercial purposes with attribution.

## Author

**Bella**  
University of Iowa — Tippie College of Business  
BAIS:3300 Business Applications of Artificial Intelligence — Spring 2026

## Contact

GitHub: [github.com/bella](https://github.com/bella)  
*(Update this link with your actual GitHub username)*

## Acknowledgements

- [Recharts](https://recharts.org/) — composable charting library for React that made the results visualizations straightforward to build
- [Drizzle ORM](https://orm.drizzle.team/) — type-safe ORM that made schema management and queries clean and predictable
- [Orval](https://orval.dev/) — OpenAPI codegen tool that generated all the React Query hooks and Zod schemas from a single spec file
- [shadcn/ui](https://ui.shadcn.com/) — component patterns and Tailwind conventions used throughout the UI
- [Vite](https://vitejs.dev/) documentation for fast HMR setup and environment variable handling
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) — referenced throughout development to meet Level AA accessibility requirements
- [Replit Agent](https://replit.com/) — AI assistant used to scaffold, implement, and debug the full-stack application

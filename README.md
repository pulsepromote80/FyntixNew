# Frontend App

Production-ready, scalable frontend scaffold for a Next.js (App Router) application, built to sit in front of an **ASP.NET Core Web API** backend.

> **Scope of this scaffold:** architecture, folder structure, reusable UI components, middleware, providers, hooks, services, stores, schemas, and types. The actual `.NET` API integration is intentionally **not implemented** — every place that will eventually call the backend is marked with a comment and returns a placeholder `501 Not Implemented` response.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| HTTP client | Axios |
| Server state | TanStack Query |
| Client/UI state | Zustand |
| Forms | React Hook Form |
| Validation | Zod |
| Lint/format | ESLint + Prettier |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

## Folder structure & why

```
src/
├── app/                  # Routing only. No business logic.
│   ├── (auth)/           # Public auth routes: login, forgot/reset password
│   ├── (protected)/      # Authenticated app shell + pages
│   └── api/               # Route Handlers — the ONLY thing the browser talks to
├── components/
│   ├── ui/               # Generic, app-agnostic primitives (Button, Input, Modal…)
│   ├── layout/            # App chrome: Navbar, Sidebar, Footer…
│   ├── common/            # Reusable app-level building blocks (DataTable, PageHeader…)
│   └── forms/              # React-Hook-Form-aware field wrappers
├── features/               # Business/domain logic, one folder per domain
│   └── <feature>/
│       ├── components/    # Feature-specific UI
│       ├── hooks/          # TanStack Query hooks for this feature
│       ├── services/       # Thin re-exports of src/services/* for local imports
│       ├── schemas/        # Zod schemas for this feature's forms
│       └── types.ts
├── hooks/                  # Cross-feature, generic hooks
├── lib/                    # Framework-agnostic infrastructure (axios, env, utils)
├── services/                # Browser-facing API clients — only ever call /api/*
├── store/                   # Zustand stores (UI state only — never tokens)
├── providers/                # Client-side provider composition root
├── schemas/                  # Shared Zod schemas
├── types/                     # Shared TypeScript types
├── config/                     # Static config: navigation, site metadata
└── middleware.ts                # Route protection only — no heavy logic
```

### Why a `features/` layer on top of `components/` and `services/`?

- `components/ui`, `components/layout`, `components/common` are **generic** — they know nothing about users, transactions, or auth.
- `features/<name>` holds everything **specific to one business domain**, so a feature can be understood, modified, or removed independently.
- `src/services` holds the actual Axios calls; `features/<name>/services` just re-exports the relevant one so feature code never reaches outside its own folder to know where things live. If a service is only ever used by one feature, it's fine to move its implementation directly into that feature's `services/` folder instead.

## The browser never talks to the .NET backend directly

```
Browser  →  /api/*  (Next.js Route Handlers, src/app/api/**)  →  ASP.NET Core Web API
```

- `src/lib/axios.ts` (`httpClient`) is the **only** Axios instance used by client components/services, and its `baseURL` is hardcoded to `/api`.
- `src/lib/backend-client.ts` (`createBackendClient`) is **server-only** and is the only place that reads `BACKEND_API_URL`. It must never be imported into a `"use client"` file.
- `BACKEND_API_URL` is a plain (non-`NEXT_PUBLIC_`) environment variable, so it is never bundled into client JavaScript.

## Authentication

- The session/access token is stored as an **HttpOnly cookie**, set by `/api/auth/login` and cleared by `/api/auth/logout`. It is never accessible from JavaScript and never stored in `localStorage`/`sessionStorage`.
- `src/store/auth.store.ts` (Zustand) only ever holds the **non-sensitive** user profile (id, name, email, roles) for fast client reads — never the token itself.
- `src/middleware.ts` only checks for the **presence** of the session cookie to redirect between public/protected routes. It does not validate the token, keeping it fast; real validation happens server-side in Route Handlers (and ultimately the .NET backend).

## Wiring up the real backend later

1. Fill in `BACKEND_API_URL` (and any auth secret) in `.env.local`.
2. In each `src/app/api/**/route.ts`, replace the placeholder `501` response with a real call via `createBackendClient()`.
3. Adjust `src/types/api.ts` if the backend's response envelope differs from the `ApiSuccess` / `ApiError` shape assumed here.
4. No folder restructuring should be required — every future backend call has a designated home already.

## Scripts

```bash
npm run dev          # start dev server
npm run build         # production build
npm run start          # start production server
npm run lint             # eslint
npm run lint:fix          # eslint --fix
npm run format              # prettier --write
npm run typecheck             # tsc --noEmit
```

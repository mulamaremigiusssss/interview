# Mini Ticket Tracker

A small full-stack support-ticket tracker.

- **Backend:** Node.js + Express
- **Database:** PostgreSQL 16
- **Frontend:** React (Vite)
- **Tests:** Jest + Supertest (integration tests against a real PostgreSQL database)

## Project structure

```
backend/    Express API (src/), SQL schema (db/), tests (tests/)
frontend/   React single-page UI
docker-compose.yml   PostgreSQL for dev (port 5432) and tests (port 5433)
```

## Setup & run

Prerequisites: Node.js 18+ and Docker (or any local PostgreSQL 13+).

```bash
# 1. Start PostgreSQL (dev + test databases)
docker compose up -d

# 2. Backend (http://localhost:4000)
cd backend
cp .env.example .env
npm install
npm run dev          # runs the migration automatically on startup

# 3. Frontend (http://localhost:5173) - in a second terminal
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api/*` to the backend.

Without Docker: create a PostgreSQL database and set `DATABASE_URL` (and `TEST_DATABASE_URL`) in `backend/.env`.

## Running the tests

```bash
docker compose up -d db_test
cd backend
npm test
```

11 integration tests cover create (+validation), list (filter + pagination), patch (+404/400) and stats.
The tests use a separate database and truncate the `tickets` table between tests.

## API

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/tickets` | Create. Body: `title` (required), `description`, `status`, `priority` |
| GET    | `/tickets?status=&page=&limit=` | List, newest first. `limit` defaults to 10 (max 100) |
| PATCH  | `/tickets/:id` | Update `status` and/or `priority` |
| GET    | `/tickets/stats` | `{ "open": n, "in_progress": n, "closed": n }` |

List response:
```json
{ "data": [ ... ], "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```
Errors are returned as `{ "errors": ["..."] }` with 400 (validation), 404 (not found) or 500.

## Decisions & Tradeoffs

I used Express with the plain `pg` driver and a single SQL schema file instead of an ORM, to keep the code small and the SQL visible. Status and priority are PostgreSQL enums, so the database enforces valid values in addition to the API-level validation. IDs are UUIDs, which avoid exposing sequential ids. The migration is idempotent and runs on server startup, which is convenient here but a real project should use a proper migration tool (e.g. node-pg-migrate or Flyway) with versioned migrations. Validation is hand-written rather than using a library like zod/Joi, and PATCH deliberately only accepts `status` and `priority`, as specified. `GET /tickets/stats` always returns all three statuses, even with a zero count, so the UI never has to handle missing keys. Pagination uses limit/offset, which is simple but gets slower on very large tables; keyset pagination would be better at scale. The tests hit a real database rather than mocks, which is more trustworthy but needs Postgres running. With more time I would add authentication, ticket assignment/comments, frontend component tests, a Dockerfile for the app, CI, and optimistic UI updates.

**Assumptions:** `priority` defaults to `medium` and `status` to `open` on creation; `GET /tickets` sorts by newest first; the UI is a single page with a stats bar, a create form, a status filter and pagination.

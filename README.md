# Car Dealer Platform

This repo now runs as a complete full-stack app:

- `frontend/` - Vite + React client
- `backend/` - Express API with auth, PostgreSQL persistence, and Cloudinary-ready image uploads

## Run locally

1. Install everything:
   `npm run install:all`
2. Start PostgreSQL and set `DATABASE_URL`
3. Optional for production-like uploads: set Cloudinary env vars
4. Start the backend:
   `npm run dev:backend`
5. In another terminal, start the frontend:
   `npm run dev:frontend`

Frontend runs on `http://localhost:5173` and talks to the backend on `http://localhost:4000`.

## Backend features

- Admin login API
- Cars CRUD API
- Admin contact API
- PostgreSQL auto-init and seed
- Cloudinary-backed upload API in production
- Fallback inline uploads for local development when Cloudinary is not configured

## Environment variables

You can set these before starting the backend:

- `DATABASE_URL`
- `PORT`
- `CLIENT_ORIGIN`
- `CLIENT_ORIGINS`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_PASSWORD_HASH`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Password hash

For production, prefer `ADMIN_PASSWORD_HASH` instead of `ADMIN_PASSWORD`.

Generate it with:

`npm --workspace backend run hash:password -- your-password`

## Render deployment

- `render.yaml` now defines backend, frontend static site, and PostgreSQL database together
- Set backend `ADMIN_PASSWORD_HASH` instead of plain password when possible
- Set frontend `VITE_API_BASE_URL` to your backend Render URL
- Set backend `CLIENT_ORIGIN` to your frontend Render URL
- Set Cloudinary env vars on backend so uploads stay production-safe

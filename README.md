# Car Dealer Platform

This repo now runs as a complete full-stack app:

- `frontend/` - Vite + React client
- `backend/` - Express API with auth, PostgreSQL persistence, and deploy-safe image storage

## Run locally

1. Install everything:
   `npm run install:all`
2. Start PostgreSQL and set `DATABASE_URL`
3. Start the backend:
   `npm run dev:backend`
4. In another terminal, start the frontend:
   `npm run dev:frontend`

Frontend runs on `http://localhost:5173` and talks to the backend on `http://localhost:4000`.

## Backend features

- Admin login API
- Cars CRUD API
- Admin contact API
- PostgreSQL auto-init and seed
- Upload API that returns deploy-safe data URLs

## Environment variables

You can set these before starting the backend:

- `DATABASE_URL`
- `PORT`
- `CLIENT_ORIGIN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

## Render deployment

- Backend on Render Web Service
- Database on Render PostgreSQL
- Set backend `DATABASE_URL` to the Render database external URL
- Set frontend `VITE_API_BASE_URL` to your backend Render URL
- Set backend `CLIENT_ORIGIN` to your frontend Render URL

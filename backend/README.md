# Backend

This Express backend provides:

- admin authentication
- PostgreSQL-backed car listing CRUD
- admin contact management
- deploy-safe image storage as data URLs
- automatic schema creation and seed data on first boot

## Run

1. Install dependencies:
   `npm install`
2. Start server:
   `npm start`

The API listens on `http://localhost:4000` by default.

## Required environment variables

- `DATABASE_URL`
- `JWT_SECRET`

## Optional environment variables

- `PORT`
- `CLIENT_ORIGIN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Render notes

- Create a Render PostgreSQL database and copy its `External Database URL` into `DATABASE_URL`
- Point `CLIENT_ORIGIN` to your frontend domain
- Uploaded images are stored as data URLs in PostgreSQL, so they survive deploys and restarts

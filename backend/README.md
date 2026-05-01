# Backend

This Express backend provides:

- admin authentication
- PostgreSQL-backed car listing CRUD
- admin contact management
- Cloudinary-backed image uploads in production
- automatic schema creation and seed data on first boot
- optional hashed admin password support

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
- `CLIENT_ORIGINS`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_PASSWORD_HASH`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Generate admin password hash

`npm run hash:password -- your-password`

## Render notes

- Create a Render PostgreSQL database and copy its `External Database URL` into `DATABASE_URL`
- Point `CLIENT_ORIGIN` to your frontend domain
- Add Cloudinary credentials so uploaded images are stored outside Render's ephemeral filesystem
- Prefer `ADMIN_PASSWORD_HASH` over a plain admin password in production

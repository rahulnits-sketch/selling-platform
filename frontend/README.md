**Welcome to Rahul Auto Market** 

**About**

This is a standalone local car marketplace app.

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Changes made locally are reflected in your local development server.

**Prerequisites:** 

1. Open the project directory
2. Install dependencies: `npm install`

Run the app: `npm run dev`

Build for production: `npm run build`

**Vercel deployment**

- Set the project Root Directory to `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Add `VITE_API_BASE_URL` in Vercel Environment Variables and point it to your deployed backend URL
- Keep `vercel.json` in this folder so React Router routes rewrite to `index.html`

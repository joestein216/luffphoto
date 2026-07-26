# LUFF Photography — Fresh Next.js starter

This repository was reset to a fresh, minimal Next.js starter to avoid build artifacts and injected wrappers. The build scripts are standard and there are no custom steps that reference .v0 or Vercel-injected files.

How to run locally
1. Install:
   npm install
2. Create a .env.local file (if you plan to enable the Dropbox API later)
3. Run locally:
   npm run dev

Vercel deployment notes
- Before deploying on Vercel, clear the build cache for the project (Redeploy -> Clear cache and redeploy) to ensure no stale injected wrappers remain.
- Ensure the project Build Command is: npm run build
- Add any required environment variables (DROPBOX_TOKEN) under Project Settings -> Environment Variables.

If you want, I can now re-add a Dropbox-driven API route that lists images from your shared link and returns temporary links. This will require a DROPBOX_TOKEN environment variable in Vercel. Tell me if you want that restored now.

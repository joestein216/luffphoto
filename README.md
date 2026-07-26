# LUFF Photography — Next.js portfolio (Dropbox-driven)

This is a small Next.js site that displays the contents of a Dropbox shared folder as the photographer's portfolio. The site uses an API route that calls the Dropbox API to list the shared folder and get temporary direct links for each image.

How it works
- The server-side API (/api/photos) calls Dropbox's API using a DROPBOX_TOKEN server-side token.
- It lists the shared link folder and requests temporary links for each file, returning an array of { id, name, link } to the client.
- The client displays them in a responsive dark-themed grid. Updating the contents of the Dropbox folder updates the site gallery automatically.

Setup
1. Clone / create project and add files above.
2. Create a Dropbox App to get an API token:
   - Go to https://www.dropbox.com/developers/apps
   - Create an app with the needed scopes: files.content.read and sharing.read (or use full Dropbox if you prefer).
   - Generate an access token in the App Console (or use OAuth in a production app).
3. Create a .env.local file in the project root:

```
DROPBOX_TOKEN=sl.ABC...   # your Dropbox API token (keep secret)
DROPBOX_SHARED_LINK=https://www.dropbox.com/scl/fo/nuvk9nr6s9p7oleyaid8p/AITlNb-YHhndqCzCBsXvcYA?dl=0
```

4. Install and run:
   - npm install
   - npm run dev
5. Visit http://localhost:3000

Notes, security, and production
- The DROPBOX_TOKEN must be kept secret (store it in environment variables, not client-side).
- For production, create an OAuth flow or a long-lived access token with proper scopes. Do not check tokens into source control.
- The API route caches responses for 60 seconds via s-maxage header; tune or add a server-side cache as needed.
- If you'd like to avoid Dropbox API tokens altogether, the site could instead fetch images by scraping the shared-link HTML — but that is fragile and not recommended.

If you want, I can:
- Convert to the Next.js app-router (app/) structure.
- Add pagination, image captions (read from Dropbox file names or a JSON sidecar file), or a CMS-style JSON file stored in Dropbox for per-photo metadata (title, location, camera, etc).
- Add automatic image pre-fetching, optimized resizing, or use the Next.js Image component (requires handling external domains or proxying images).

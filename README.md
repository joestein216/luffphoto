# LUFF Photography

This repo now uses a secure server-side gallery that fetches images from Dropbox via a server-only token. Tokens must be set in Vercel as environment variables and are not exposed to the client.

Required environment variables (Vercel/project settings):
- DROPBOX_TOKEN (server-only secret)
- DROPBOX_SHARED_LINK (optional; shared-link URL for the parent folder)
- DROPBOX_ROOT_PATH (optional; e.g. `/portfolio` — path inside the shared link or account)

How it works
- The server-side API (/api/photos) lists files using the configured shared link or root path, filters to JPG/JPEG files, and requests temporary links from Dropbox for each file.
- The site's main page uses getServerSideProps to call /api/photos server-side so the DROPBOX_TOKEN remains secret.

If you need help regenerating a Dropbox token or creating a shared link for a subfolder, tell me and I will walk you through it.

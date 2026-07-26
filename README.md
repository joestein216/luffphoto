# LUFF Photography — Client-side debug mode

I updated the site to include a temporary client-side debug mode that calls Dropbox APIs directly from the browser. This is intended to help you see errors in the browser console and on the page without needing Vercel function logs.

IMPORTANT: This exposes the Dropbox token to anyone who can load your site. Use only for short-term debugging. For production, use a server-side token (DROPBOX_TOKEN) and the /api/photos endpoint.

How to use client debug mode
1. Set environment variables in Vercel (or in your local .env.local when running locally):

```
NEXT_PUBLIC_DROPBOX_TOKEN=sl.ABC...   # temporary token for debugging ONLY
NEXT_PUBLIC_DROPBOX_SHARED_LINK=https://www.dropbox.com/scl/fo/nuvk9nr6s9p7oleyaid8p/AITlNb-YHhndqCzCBsXvcYA?dl=0
```

2. Redeploy or rebuild so NEXT_PUBLIC_* values are available to the client.
3. Open your deployed site and check the page — it will show debug logs and any Dropbox API errors on the page.

What it does
- Calls Dropbox /2/files/list_folder with the shared link to list files
- Filters to .jpg/.jpeg files
- Calls /2/files/get_temporary_link for each file to get a direct link
- Displays images and a debug log with any Dropbox error text

If you see errors in the debug log, paste them here and I will interpret them and advise the fix (usually token scopes or shared-link issues).

// Minimal API placeholder for photos
// To enable Dropbox-driven gallery, set DROPBOX_TOKEN and DROPBOX_SHARED_LINK in the environment and implement calls to Dropbox API.

export default function handler(req, res) {
  res.status(200).json({ photos: [] })
}

import { Dropbox } from "dropbox"

export default async function handler(req, res) {
  const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN
  const SHARED_LINK = process.env.DROPBOX_SHARED_LINK || ''
  const ROOT_PATH = process.env.DROPBOX_ROOT_PATH || '' // e.g. '/portfolio' or '/Luff Photo/portfolio'

  if (!DROPBOX_TOKEN) {
    return res.status(500).json({ error: 'Missing DROPBOX_TOKEN in environment. Set DROPBOX_TOKEN in Vercel/Env.' })
  }

  try {
    const dbx = new Dropbox({
      clientId: process.env.DROPBOX_APP_KEY,
      clientSecret: process.env.DROPBOX_APP_SECRET,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    });

    // 2. Make your API call normally. 
    // The SDK automatically handles exchanging the refresh token for a short-lived access token.
    const { result } = await dbx.filesListFolder({ 
      path: '/Luff Photo/portfolio' // Empty string searches the root directory of your App folder
    });

    const allFiles = (result.entries || []).filter(e => e['.tag'] === 'file')

    // Filter to jpg/jpeg only
    const jpgFiles = allFiles.filter(f => /\.(jpe?g)$/i.test(f.name || ''))

    const errors = []
    const photos = []

    for (const f of jpgFiles) {
      const fileLink = await dbx.filesGetTemporaryLink({ path: f.path_display })
      console.log(fileLink)

      photos.push({ id: fileLink.result.metadata.id, name: fileLink.result.metadata.name, link: fileLink.result.link, client_modified: fileLink.result.metadata.client_modified, size: fileLink.result.metadata.size })
   }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json({ photos, errors })
  } catch (err) {
    console.error('Server error in /api/photos:', err)
    return res.status(500).json({ error: 'Server error', detail: String(err) })
  }
}

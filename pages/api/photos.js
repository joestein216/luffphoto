// Server-side API route that lists a Dropbox shared folder and returns temporary direct links.
// Requires process.env.DROPBOX_TOKEN and optionally process.env.DROPBOX_SHARED_LINK

export default async function handler(req, res) {
  const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN
  const SHARED_LINK = process.env.DROPBOX_SHARED_LINK || 'https://www.dropbox.com/scl/fo/nuvk9nr6s9p7oleyaid8p/AITlNb-YHhndqCzCBsXvcYA?rlkey=uk38lz3t89m8ssq20tquznpwi&st=dqasu20y&dl=0'

  if (!DROPBOX_TOKEN) {
    return res.status(500).json({ error: 'Missing DROPBOX_TOKEN in environment' })
  }

  try {
    // 1) list folder entries using shared_link
    const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '',
        shared_link: { url: SHARED_LINK },
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false
      })
    })

    if (!listResp.ok) {
      const err = await listResp.text()
      return res.status(500).json({ error: 'Dropbox list_folder error', detail: err })
    }

    const listJson = await listResp.json()
    const files = (listJson.entries || []).filter(e => e['.tag'] === 'file')

    // 2) for each file request a temporary link (direct download link)
    const photos = await Promise.all(files.map(async (f) => {
      // files/get_temporary_link accepts a path; including shared_link ensures it works for shared folders
      const body = { path: f.path_lower, shared_link: { url: SHARED_LINK } }
      const tmpResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DROPBOX_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!tmpResp.ok) {
        return { id: f.id, name: f.name, link: null, error: 'failed to get temp link' }
      }
      const tmp = await tmpResp.json()
      return {
        id: f.id,
        name: f.name,
        link: tmp.link, // temporary direct link
        client_modified: f.client_modified,
        size: f.size
      }
    }))

    // Return sorted by name, newest, or leave as is — here we return as-is
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300') // short CDN caching
    return res.status(200).json({ photos })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error', detail: String(err) })
  }
}

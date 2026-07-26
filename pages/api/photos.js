// pages/api/photos.js
// Lists files in a Dropbox folder (supports shared link or direct token access) and returns temporary links for JPG/JPEG images.
// Supports DROPBOX_SHARED_LINK (shared folder link) and DROPBOX_ROOT_PATH (path inside the shared link or account, e.g. '/portfolio').

export default async function handler(req, res) {
  const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN
  const SHARED_LINK = process.env.DROPBOX_SHARED_LINK || ''
  const ROOT_PATH = process.env.DROPBOX_ROOT_PATH || '' // e.g. '/portfolio' or '/Luff Photo/portfolio'

  if (!DROPBOX_TOKEN) {
    return res.status(500).json({ error: 'Missing DROPBOX_TOKEN in environment. Set DROPBOX_TOKEN in Vercel/Env.' })
  }

  try {
    // Build list_folder request body. Use ROOT_PATH when provided.
    const listBody = SHARED_LINK
      ? { path: ROOT_PATH || '', shared_link: { url: SHARED_LINK }, recursive: false }
      : { path: ROOT_PATH || '', recursive: false }

    console.log('Listing Dropbox folder', { rootPath: ROOT_PATH, sharedLink: !!SHARED_LINK })

    const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listBody)
    })

    if (!listResp.ok) {
      const text = await listResp.text().catch(() => '')
      console.error('Dropbox list_folder error:', listResp.status, text)
      return res.status(502).json({ error: 'Dropbox list_folder error', detail: text })
    }

    const listJson = await listResp.json()
    const allFiles = (listJson.entries || []).filter(e => e['.tag'] === 'file')

    // Filter to jpg/jpeg only
    const jpgFiles = allFiles.filter(f => /\.(jpe?g)$/i.test(f.name || ''))

    const errors = []
    const photos = []

    for (const f of jpgFiles) {
      let got = false

      // Attempt 1: use the shared_link + path (if SHARED_LINK is provided)
      if (SHARED_LINK) {
        try {
          const body = { path: f.path_lower || f.path_display || f.path, shared_link: { url: SHARED_LINK } }
          const tmpResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${DROPBOX_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })

          if (tmpResp.ok) {
            const tmp = await tmpResp.json()
            if (tmp && tmp.link) {
              photos.push({ id: f.id, name: f.name, link: tmp.link, client_modified: f.client_modified, size: f.size })
              got = true
              continue
            }
          } else {
            const t = await tmpResp.text().catch(() => '')
            console.warn('get_temporary_link with shared_link failed for', f.path_lower, tmpResp.status, t)
            errors.push({ file: f.name, method: 'shared_link+path', status: tmpResp.status, detail: t })
          }
        } catch (err) {
          console.error('Error calling get_temporary_link with shared_link for', f.name, err)
          errors.push({ file: f.name, method: 'shared_link+path', error: String(err) })
        }
      }

      // Attempt 2: use file id (works when the token belongs to the owner and has access)
      if (!got && f.id) {
        try {
          const body = { path: f.id }
          const tmpResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${DROPBOX_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })

          if (tmpResp.ok) {
            const tmp = await tmpResp.json()
            if (tmp && tmp.link) {
              photos.push({ id: f.id, name: f.name, link: tmp.link, client_modified: f.client_modified, size: f.size })
              got = true
              continue
            }
          } else {
            const t = await tmpResp.text().catch(() => '')
            console.warn('get_temporary_link with id failed for', f.id, tmpResp.status, t)
            errors.push({ file: f.name, method: 'id', status: tmpResp.status, detail: t })
          }
        } catch (err) {
          console.error('Error calling get_temporary_link with id for', f.name, err)
          errors.push({ file: f.name, method: 'id', error: String(err) })
        }
      }

      if (!got) {
        errors.push({ file: f.name, message: 'could not obtain temporary link with either shared_link+path or id' })
      }
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json({ photos, errors })
  } catch (err) {
    console.error('Server error in /api/photos:', err)
    return res.status(500).json({ error: 'Server error', detail: String(err) })
  }
}

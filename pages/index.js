import { useEffect, useState } from 'react'

export default function Home() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    async function loadClient() {
      setLoading(true)
      setError(null)
      setLogs([])

      // IMPORTANT: For debugging only. This uses a client-visible token.
      const TOKEN = process.env.NEXT_PUBLIC_DROPBOX_TOKEN
      const SHARED_LINK = process.env.NEXT_PUBLIC_DROPBOX_SHARED_LINK || 'https://www.dropbox.com/scl/fo/nuvk9nr6s9p7oleyaid8p/AITlNb-YHhndqCzCBsXvcYA?dl=0'

      if (!TOKEN) {
        setError('Missing NEXT_PUBLIC_DROPBOX_TOKEN — set this env var for client-side debugging (temporary)')
        setLoading(false)
        return
      }

      try {
        const log = (m) => setLogs((l) => [...l, m])
        log('Listing folder via Dropbox API (client-side)')

        const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: '', shared_link: { url: SHARED_LINK }, recursive: false })
        })

        if (!listResp.ok) {
          const txt = await listResp.text().catch(() => '')
          log('list_folder failed: ' + listResp.status + ' ' + txt)
          throw new Error('list_folder failed: ' + (txt || listResp.status))
        }

        const listJson = await listResp.json()
        const files = (listJson.entries || []).filter(e => e['.tag'] === 'file')
        log(`Found ${files.length} file(s) in shared folder`)

        // Filter to jpg/jpeg only
        const jpgFiles = files.filter(f => /\.(jpe?g)$/i.test(f.name || ''))
        log(`Filtered to ${jpgFiles.length} JPG/JPEG file(s)`)

        const photos = []
        for (const f of jpgFiles) {
          try {
            const body = { path: f.path_lower || f.path_display || f.path, shared_link: { url: SHARED_LINK } }
            const tmpResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            })

            if (!tmpResp.ok) {
              const t = await tmpResp.text().catch(() => '')
              log(`get_temporary_link failed for ${f.name}: ${tmpResp.status} ${t}`)
              continue
            }

            const tmp = await tmpResp.json()
            if (!tmp || !tmp.link) {
              log(`get_temporary_link returned no link for ${f.name}: ${JSON.stringify(tmp)}`)
              continue
            }

            photos.push({ id: f.id, name: f.name, link: tmp.link })
            log(`Added ${f.name}`)
          } catch (err) {
            log(`Error for ${f.name}: ${String(err)}`)
          }
        }

        setPhotos(photos)
      } catch (err) {
        console.error(err)
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [])

  return (
    <div className="page">
      <header className="header">
        <h1>LUFF Photography</h1>
        <p className="tag">Client-side debug gallery (temporary)</p>
      </header>

      <main className="container">
        <section className="intro">
          <h2>Portfolio</h2>
          <p className="muted">This client-mode fetches Dropbox APIs directly in the browser for easier debugging. Do NOT use a production token here — it will be visible to anyone.</p>
        </section>

        {loading && <p className="muted">Loading photos…</p>}
        {error && <p className="error">Error: {error}</p>}

        <section className="grid">
          {photos.map((p) => (
            <div key={p.id} className="thumb">
              <img src={p.link} alt={p.name} loading="lazy" />
              <div className="caption">{p.name}</div>
            </div>
          ))}

          {!loading && photos.length === 0 && !error && (
            <div className="thumb empty">No JPG photos found — check shared link and token</div>
          )}
        </section>

        <section style={{ marginTop: 24 }}>
          <h3>Debug logs</h3>
          <div style={{ background: '#0b0b0d', padding: 12, borderRadius: 8, color: '#9aa0a6' }}>
            {logs.length === 0 && <div className="muted">No logs yet</div>}
            {logs.map((l, i) => (
              <div key={i} style={{ fontFamily: 'monospace', fontSize: 13 }}>{l}</div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>© {new Date().getFullYear()} LUFF Photography</div>
      </footer>
    </div>
  )
}

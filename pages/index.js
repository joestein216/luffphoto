import { useState } from 'react'

export default function Home({ photos = [], errors = [] }) {
  const [modal, setModal] = useState({ open: false, src: '', name: '' })

  return (
    <div className="page">
      <header className="header">
        <h1>LUFF Photography</h1>
        <p className="tag">Server-side gallery — secure, production-ready</p>
      </header>

      <main className="container">
        <section className="intro">
          <h2>Portfolio</h2>
          <p className="muted">Images are fetched server-side from Dropbox; tokens remain secret. Click a thumbnail to view a larger image.</p>
        </section>

        {errors && errors.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <div className="errorPanel">
              <strong>Some files failed to generate temporary links:</strong>
              <ul>
                {errors.slice(0, 10).map((e, i) => (
                  <li key={i} style={{ fontFamily: 'monospace', fontSize: 13 }}>{e.file} — {e.method || ''} {e.status ? `(${e.status})` : ''} {e.detail ? `: ${String(e.detail).slice(0,120)}` : ''}</li>
                ))}
                {errors.length > 10 && <li>...and {errors.length - 10} more</li>}
              </ul>
            </div>
          </section>
        )}

        <section className="grid">
          {photos.map((p) => (
            <button
              key={p.id}
              className="thumb"
              onClick={() => setModal({ open: true, src: p.link, name: p.name })}
            >
              <img src={p.link} alt={p.name} loading="lazy" />
              <div className="caption">{p.name}</div>
            </button>
          ))}

          {photos.length === 0 && (
            <div className="thumb empty">No photos found — check DROPBOX_TOKEN, DROPBOX_SHARED_LINK and DROPBOX_ROOT_PATH</div>
          )}
        </section>
      </main>

      {modal.open && (
        <div className="modal" onClick={() => setModal({ open: false, src: '', name: '' })}>
          <div className="modalInner" onClick={(e) => e.stopPropagation()}>
            <img src={modal.src} alt={modal.name} />
            <div className="modalCaption">{modal.name}</div>
            <button className="close" onClick={() => setModal({ open: false, src: '', name: '' })}>✕</button>
          </div>
        </div>
      )}

      <footer className="footer">
        <div>© {new Date().getFullYear()} LUFF Photography</div>
      </footer>
    </div>
  )
}

export async function getServerSideProps(context) {
  const req = context.req
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host
  const origin = `${proto}://${host}`

  try {
    const res = await fetch(`${origin}/api/photos`)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('Server-side fetch /api/photos failed', res.status, text)
      return { props: { photos: [], errors: [{ message: 'Server error fetching photos', detail: text }] } }
    }

    const json = await res.json()
    return { props: { photos: json.photos || [], errors: json.errors || [] } }
  } catch (err) {
    console.error('Server-side error fetching /api/photos', String(err))
    return { props: { photos: [], errors: [{ message: 'Server error', detail: String(err) }] } }
  }
}

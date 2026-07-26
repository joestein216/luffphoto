import { useEffect, useState } from 'react'

export default function Home() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState({ open: false, src: '', name: '' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/photos')
        if (!res.ok) throw new Error('Failed to fetch photos')
        const data = await res.json()
        setPhotos(data.photos || [])
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <header className="header">
        <h1>LUFF Photography</h1>
        <p className="tag">Photography — portfolio updates via Dropbox folder</p>
      </header>

      <main className="container">
        <section className="intro">
          <h2>Portfolio</h2>
          <p className="muted">Images come directly from the Dropbox folder — update the folder to change this gallery.</p>
        </section>

        {loading && <p className="muted">Loading photos…</p>}
        {error && <p className="error">Error: {error}</p>}

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

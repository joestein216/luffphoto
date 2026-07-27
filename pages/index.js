import { useState, useRef, useEffect } from 'react'

export default function Home({ photos = [], errors = [] }) {
  const [modal, setModal] = useState({ open: false, src: '', name: '' })
  const trackRef = useRef(null)
  const [visible, setVisible] = useState(3)

  useEffect(() => {
    function onResize() {
      const w = window.innerWidth
      if (w < 640) setVisible(1)
      else if (w < 1024) setVisible(2)
      else setVisible(3)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scrollNext = () => {
    const el = trackRef.current
    if (!el) return
    const step = Math.floor(el.clientWidth / visible)
    el.scrollBy({ left: step, behavior: 'smooth' })
  }
  const scrollPrev = () => {
    const el = trackRef.current
    if (!el) return
    const step = Math.floor(el.clientWidth / visible)
    el.scrollBy({ left: -step, behavior: 'smooth' })
  }

  return (
    <div className="page">
      <header className="header">
        <div className="titleWrap">
          <h1 className="title small-caps">Luff Photography</h1>
          <div className="artist">Tabbitha Snaps</div>
        </div>
        <p className="bio">Short paragraph — a concise artist statement about style and philosophy. Stylized, considered imagery that emphasizes form, texture and emotion.</p>
      </header>

      <main className="container">
        <section className="carouselSection">
          <div className="carouselHead">
            <h2 className="sectionTitle">Photos</h2>
            <div className="navButtons">
              <button aria-label="Previous" className="nav" onClick={scrollPrev}>‹</button>
              <button aria-label="Next" className="nav" onClick={scrollNext}>›</button>
            </div>
          </div>

          <div className="carousel" ref={trackRef}>
            {photos.map((p) => (
              <div key={p.id} className="photoCard" onClick={() => setModal({ open: true, src: p.link, name: p.name })}>
                <div className="photoInner">
                  <img src={p.link} alt={p.name} />
                </div>
              </div>
            ))}
          </div>

          {errors && errors.length > 0 && (
            <div className="errorPanel small">
              Some images could not be loaded — check configuration. ({errors.length} error{errors.length>1? 's' : ''})
            </div>
          )}
        </section>

        <section className="connect">
          <h3>Connect with me</h3>
          <p className="muted">Follow and reach out</p>
          <div className="social">
            <a href="#" className="socialLink">Instagram</a>
            <a href="#" className="socialLink">Behance</a>
            <a href="mailto:tabbitha@example.com" className="socialLink">Email</a>
          </div>
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
        <div className="footerLeft">Artistic portraiture &nbsp;—&nbsp; stylized</div>
        <div className="footerRight">Luff Photo © 2026</div>
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

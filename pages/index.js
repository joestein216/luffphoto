export default function Home() {
  return (
    <div className="page">
      <header className="header">
        <h1>LUFF Photography</h1>
        <p className="tag">Dark portfolio — edit Dropbox folder to update gallery</p>
      </header>

      <main className="container">
        <section className="intro">
          <h2>Portfolio</h2>
          <p className="muted">This site is set up to show images from a Dropbox folder. Configure the Dropbox token in environment variables and the API will serve gallery images dynamically.</p>
        </section>

        <section className="grid placeholder">
          <div className="thumb empty">No photos yet — set DROPBOX_TOKEN and DROPBOX_SHARED_LINK</div>
        </section>
      </main>

      <footer className="footer">
        <div>© {new Date().getFullYear()} LUFF Photography</div>
      </footer>
    </div>
  )
}

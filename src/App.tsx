import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { SiteHeader } from './components/SiteHeader'
import { HomePage } from './pages/HomePage'
import { YouTubeClonePage } from './pages/YouTubeClonePage'

function ScrollManager() {
  const location = useLocation()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      // Wait a tick so the home page is mounted before scrolling.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })
      previousPathname.current = location.pathname
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    const pathChanged =
      previousPathname.current !== null && previousPathname.current !== location.pathname
    previousPathname.current = location.pathname

    // After in-app route changes, move focus into the page landmark (skip link target).
    if (pathChanged) {
      const main = document.getElementById('main-content')
      if (main instanceof HTMLElement) {
        main.focus({ preventScroll: true })
      }
    }
  }, [location.pathname, location.hash])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work/youtube-clone" element={<YouTubeClonePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

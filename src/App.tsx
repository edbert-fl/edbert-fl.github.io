import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SiteHeader } from './components/SiteHeader'
import { HomePage } from './pages/HomePage'

function ScrollManager() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      // Wait a tick so the home page is mounted before scrolling.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

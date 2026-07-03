import { AboutSection } from './components/About'
import { ContactSection } from './components/Contact'
import { Hero } from './components/Hero'
import { ExperienceSection } from './components/Experience'
import { SiteHeader } from './components/SiteHeader'
import { WorkSection } from './components/Work'

function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <AboutSection />
        <WorkSection />
        <ExperienceSection />
        <ContactSection />
      </main>
    </>
  )
}

export default App

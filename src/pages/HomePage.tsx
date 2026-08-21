import { AboutSection } from '../components/About'
import { ContactSection } from '../components/Contact'
import { ExperienceSection } from '../components/Experience'
import { Hero } from '../components/Hero'
import { WorkSection } from '../components/Work'

export function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <AboutSection />
      <WorkSection />
      <ExperienceSection />
      <ContactSection />
    </main>
  )
}

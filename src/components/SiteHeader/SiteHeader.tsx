import { motion, useScroll, useSpring } from 'motion/react'
import { SITE_NAME, SITE_ROLE } from '../../data/site'
import './SiteHeader.css'

export function SiteHeader() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <motion.div
        className="site-header__progress"
        style={{ scaleX }}
        aria-hidden="true"
      />

      <div className="site-header__inner">
        <button
          type="button"
          className="site-header__brand"
          onClick={scrollToTop}
          aria-label={`${SITE_NAME}, scroll to top`}
        >
          <span className="site-header__name">{SITE_NAME}</span>
          <span className="site-header__role">{SITE_ROLE}</span>
        </button>

        <nav className="site-header__nav" aria-label="Primary">
          <ul className="site-header__nav-list">
            <li>
              <a className="site-header__nav-link" href="#about">
                About
              </a>
            </li>
            <li>
              <a className="site-header__nav-link" href="#work">
                Work
              </a>
            </li>
            <li>
              <a className="site-header__nav-link" href="#experience">
                Experience
              </a>
            </li>
            <li>
              <a className="site-header__nav-link" href="#contact">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

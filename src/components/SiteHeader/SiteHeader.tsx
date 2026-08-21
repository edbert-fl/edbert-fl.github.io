import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'motion/react'
import { SITE_NAME, SITE_ROLE } from '../../data/site'
import './SiteHeader.css'

const HOME_LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#work', label: 'Work' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#contact', label: 'Contact' },
] as const

export function SiteHeader() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

  return (
    <header className="site-header">
      <motion.div
        className="site-header__progress"
        style={{ scaleX }}
        aria-hidden="true"
      />

      <div className="site-header__inner">
        <Link
          to="/"
          className="site-header__brand"
          aria-label={`${SITE_NAME}, go to home`}
        >
          <span className="site-header__name">{SITE_NAME}</span>
          <span className="site-header__role">{SITE_ROLE}</span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          <ul className="site-header__nav-list">
            {HOME_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  className="site-header__nav-link"
                  to={isHome ? link.href.slice(1) : link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

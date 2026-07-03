import { motion } from 'motion/react'
import type { ContactLink } from '../../data/contact'
import { ContactCardArt } from './ContactCardArt'
import './ContactCard.css'

interface ContactCardProps {
  link: ContactLink
  active: boolean
  onEnter: () => void
  onLeave: () => void
}

export function ContactCard({ link, active, onEnter, onLeave }: ContactCardProps) {
  return (
    <motion.a
      href={link.href}
      className={`contact-card${active ? ' contact-card--active' : ''}`}
      target={link.id === 'email' ? undefined : '_blank'}
      rel={link.id === 'email' ? undefined : 'noreferrer noopener'}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      onMouseLeave={onLeave}
      onBlur={onLeave}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <ContactCardArt channel={link.id} active={active} />

      <div className="contact-card__body">
        <span className="contact-card__label">{link.label}</span>
        <span className="contact-card__value">{link.display}</span>
        {link.id !== 'email' && <span className="sr-only"> (opens in new tab)</span>}
      </div>

      <span className="contact-card__arrow" aria-hidden="true">
        →
      </span>
    </motion.a>
  )
}

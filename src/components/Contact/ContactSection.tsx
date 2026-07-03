import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { CONTACT_LINKS, type ContactChannel } from '../../data/contact'
import { SITE_NAME } from '../../data/site'
import { GlitchText } from '../Hero/GlitchText'
import { ContactArt } from './ContactArt'
import { ContactCard } from './ContactCard'
import './ContactSection.css'

export function ContactSection() {
  const reduceMotion = useReducedMotion()
  const [activeChannel, setActiveChannel] = useState<ContactChannel | null>(null)

  return (
    <section id="contact" className="contact" aria-label="Contact">
      <ContactArt activeChannel={activeChannel} />

      <div className="contact__inner">
        <motion.header
          className="contact__header"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="contact__index">05 / Contact</span>
          <GlitchText text="Contact" as="h2" className="contact__title" startWhenVisible />
          <p className="contact__lede">
            Open to full-time and contract opportunities. Reach out by email or LinkedIn.
          </p>
        </motion.header>

        <div className="contact__channels">
          {CONTACT_LINKS.map((link, index) => (
            <motion.div
              key={link.id}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <ContactCard
                link={link}
                active={activeChannel === link.id}
                onEnter={() => setActiveChannel(link.id)}
                onLeave={() => setActiveChannel(null)}
              />
            </motion.div>
          ))}
        </div>

        <footer className="contact__footer">
          <span className="contact__footer-name">{SITE_NAME}</span>
        </footer>
      </div>
    </section>
  )
}

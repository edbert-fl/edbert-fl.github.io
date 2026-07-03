import { useInView, useReducedMotion } from 'motion/react'
import { lazy, Suspense, useRef } from 'react'
import type { ContactChannel } from '../../data/contact'
import './ContactArt.css'

const ContactCanvas = lazy(() =>
  import('./ContactCanvas').then((mod) => ({ default: mod.ContactCanvas })),
)

interface ContactArtProps {
  activeChannel: ContactChannel | null
}

export function ContactArt({ activeChannel }: ContactArtProps) {
  const reduceMotion = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(wrapRef, { once: true, margin: '-5% 0px' })

  return (
    <div ref={wrapRef} className="contact-art" aria-hidden="true">
      <div className="contact-art__grid" />
      <div className="contact-art__scanlines" />

      {!reduceMotion && isInView && (
        <Suspense fallback={null}>
          <ContactCanvas activeChannel={activeChannel} />
        </Suspense>
      )}

      <div className="contact-art__fade" />
    </div>
  )
}

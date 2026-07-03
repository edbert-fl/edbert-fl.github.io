import { motion, useReducedMotion } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  EXPERIENCE_ROLES,
  getNodeFocus,
  getPipelineFloatIndex,
} from '../../data/experience'
import { GlitchText } from '../Hero/GlitchText'
import { ExperienceCard } from './ExperienceCard'
import './ExperienceSection.css'

const ExperienceCanvas = lazy(() =>
  import('./ExperienceCanvas').then((mod) => ({ default: mod.ExperienceCanvas })),
)

const VIEWPORT_ANCHOR = 0.42

function computePathProgress(cards: HTMLElement[]) {
  if (cards.length === 0) return 0
  if (cards.length === 1) return 0

  const anchor = window.innerHeight * VIEWPORT_ANCHOR
  const centers = cards.map((card) => {
    const rect = card.getBoundingClientRect()
    return rect.top + rect.height / 2
  })

  const first = centers[0]
  const last = centers[centers.length - 1]
  const span = first - last

  if (Math.abs(span) < 1) return 0

  return Math.min(1, Math.max(0, (first - anchor) / span))
}

export function ExperienceSection() {
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [pathProgress, setPathProgress] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  useEffect(() => {
    let rafId = 0

    const update = () => {
      rafId = 0
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[]
      setPathProgress(computePathProgress(cards))
    }

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const floatIndex = getPipelineFloatIndex(pathProgress)

  const handleCardFocus = (index: number) => {
    setFocusedIndex(index)
    const card = cardRefs.current[index]
    if (!card) return
    card.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }

  const handleCardBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="experience"
      aria-label="Professional experience"
    >
      <Suspense fallback={<div className="experience__canvas-fallback" aria-hidden="true" />}>
        <ExperienceCanvas pathProgress={pathProgress} />
      </Suspense>

      <div className="experience__overlay" aria-hidden="true" />

      <div className="experience__inner">
        <motion.header
          className="experience__header"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="experience__index">04 / Experience</span>
          <GlitchText text="Experience" as="h2" className="experience__title" startWhenVisible />
          <p className="experience__lede">
            Recent roles in software engineering, research, and consulting.
          </p>
        </motion.header>

        <div className="experience__cards">
          {EXPERIENCE_ROLES.map((role, index) => {
            const focus =
              focusedIndex === index ? 1 : getNodeFocus(index, floatIndex)
            return (
              <ExperienceCard
                key={role.id}
                ref={(node) => {
                  cardRefs.current[index] = node
                }}
                role={role}
                index={index}
                focus={focus}
                onFocus={() => handleCardFocus(index)}
                onBlur={handleCardBlur}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

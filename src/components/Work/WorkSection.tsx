import { motion, useReducedMotion } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { getWorkFloatIndex, getWorkFocus, getWorkScrollTop, WORK_PROJECTS } from '../../data/work'
import { GlitchText } from '../Hero/GlitchText'
import { WorkCard } from './WorkCard'
import './WorkSection.css'

const WorkCanvas = lazy(() =>
  import('./WorkCanvas').then((mod) => ({ default: mod.WorkCanvas })),
)

function computeScrollProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect()
  const scrollable = rect.height - window.innerHeight
  if (scrollable <= 0) return 0
  const scrolled = -rect.top
  return Math.min(1, Math.max(0, scrolled / scrollable))
}

export function WorkSection() {
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  useEffect(() => {
    let rafId = 0

    const update = () => {
      rafId = 0
      const section = sectionRef.current
      if (!section) return
      setScrollProgress(computeScrollProgress(section))
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

  const floatIndex = getWorkFloatIndex(scrollProgress)
  const panelOffset = scrollProgress * (WORK_PROJECTS.length - 1) * 100

  const scrollToWorkIndex = (index: number) => {
    const section = sectionRef.current
    if (!section) return
    window.scrollTo({
      top: getWorkScrollTop(section, index),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  const handleCardFocus = (index: number) => {
    setFocusedIndex(index)
    scrollToWorkIndex(index)
  }

  const handleCardBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <section
      id="work"
      ref={sectionRef}
      className="work"
      style={
        {
          '--work-panel-offset': `${panelOffset}vw`,
          '--work-count': WORK_PROJECTS.length,
        } as CSSProperties
      }
      aria-label="Selected work"
    >
      <div className="work__stage">
        <Suspense fallback={<div className="work__canvas-fallback" aria-hidden="true" />}>
          <WorkCanvas scrollProgress={scrollProgress} />
        </Suspense>

        <div className="work__overlay" aria-hidden="true" />

        <motion.header
          className="work__header"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="work__index">03 / Work</span>
          <GlitchText text="Selected work" as="h2" className="work__title" startWhenVisible />
          <p className="work__lede">
            Projects from hackathons, client work, and university research.
          </p>
        </motion.header>

        <div className="work__panels-track">
          <div className="work__panels">
            {WORK_PROJECTS.map((project, index) => (
              <WorkCard
                key={project.id}
                project={project}
                index={index}
                focus={
                  focusedIndex === index ? 1 : getWorkFocus(index, floatIndex)
                }
                onFocus={() => handleCardFocus(index)}
                onBlur={handleCardBlur}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

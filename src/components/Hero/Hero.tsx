import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { SITE_NAME } from '../../data/site'
import { GlitchText } from './GlitchText'
import { HeroUfo } from './HeroUfo'
import { TransitionScreen } from './TransitionScreen'
import './Hero.css'

const TAGS = ['React', 'TypeScript', 'Motion', 'WebGL', 'Design Systems']
const easeOut = [0.22, 1, 0.36, 1] as const
const swipeTransition = { duration: 0.45, ease: easeOut }

type ActiveScreen = 'home' | 'work' | 'experience'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: easeOut },
  }),
}

function getScreenOffset(screen: ActiveScreen, active: ActiveScreen) {
  if (active === 'home') {
    if (screen === 'home') return '0%'
    if (screen === 'work') return '100%'
    return '-100%'
  }

  if (active === 'work') {
    if (screen === 'home') return '-100%'
    if (screen === 'work') return '0%'
    return '100%'
  }

  if (screen === 'home') return '100%'
  if (screen === 'work') return '-100%'
  return '0%'
}

function getHudLabel(active: ActiveScreen) {
  if (active === 'work') return '03 / Work'
  if (active === 'experience') return '04 / Experience'
  return '01 / Intro'
}

export function Hero() {
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const leaveTimeoutRef = useRef<number | undefined>(undefined)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home')
  const [contentBottom, setContentBottom] = useState(0)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const gridX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const gridY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const gridTransform = useMotionTemplate`translate(${gridX}px, ${gridY}px)`

  const crosshairX = useMotionValue(0)
  const crosshairY = useMotionValue(0)
  const smoothCrosshairX = useSpring(crosshairX, { stiffness: 200, damping: 25 })
  const smoothCrosshairY = useSpring(crosshairY, { stiffness: 200, damping: 25 })

  useEffect(() => {
    const section = sectionRef.current
    const nav = navRef.current
    if (!section || !nav) return

    const updateContentBottom = () => {
      const sectionRect = section.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      const gap = 32
      setContentBottom(sectionRect.bottom - navRect.top + gap)
    }

    updateContentBottom()

    const observer = new ResizeObserver(updateContentBottom)
    observer.observe(section)
    observer.observe(nav)
    window.addEventListener('resize', updateContentBottom)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateContentBottom)
    }
  }, [activeScreen])

  const setScreen = (screen: ActiveScreen) => {
    window.clearTimeout(leaveTimeoutRef.current)
    setActiveScreen(screen)
  }

  const handleNavEnter = (screen: 'work' | 'experience') => {
    window.clearTimeout(leaveTimeoutRef.current)
    setActiveScreen(screen)
  }

  const handleNavLeave = () => {
    leaveTimeoutRef.current = window.setTimeout(() => {
      setActiveScreen('home')
    }, 60)
  }

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const handleFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget
      if (next instanceof Node && nav.contains(next)) return
      handleNavLeave()
    }

    nav.addEventListener('focusout', handleFocusOut)
    return () => nav.removeEventListener('focusout', handleFocusOut)
  }, [])

  const handleNavClick = (screen: 'work' | 'experience') => {
    const targetId = screen === 'work' ? 'work' : 'experience'
    document.getElementById(targetId)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setCoords({ x: Math.round(x), y: Math.round(y) })

    if (reduceMotion) return

    mouseX.set((x - rect.width / 2) / 30)
    mouseY.set((y - rect.height / 2) / 30)
    crosshairX.set(x)
    crosshairY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setScreen('home')
  }

  const transition = reduceMotion ? { duration: 0.01 } : swipeTransition

  return (
    <>
      <section
        ref={sectionRef}
        className="hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label="Introduction"
      >
        <div className="hero__bg" aria-hidden="true">
          <motion.div className="hero__grid" style={{ translate: gridTransform }} />
          <div className="hero__scanlines" />
          <div className="hero__noise" />
          {!reduceMotion && activeScreen === 'home' && (
            <HeroUfo />
          )}
        </div>

        {!reduceMotion && (
          <motion.div
            className="hero__crosshair"
            style={{ left: smoothCrosshairX, top: smoothCrosshairY }}
            aria-hidden="true"
          />
        )}

        <div className="hero__hud hero__hud--tl" aria-hidden="true">
          {getHudLabel(activeScreen)}
        </div>
        <div className="hero__hud hero__hud--tr" aria-hidden="true">
          {SITE_NAME}
        </div>
        <div className="hero__hud hero__hud--bl" aria-hidden="true">
          X:{coords.x.toString().padStart(4, '0')} Y:{coords.y.toString().padStart(4, '0')}
        </div>
        <div className="hero__hud hero__hud--br" aria-hidden="true">
          {activeScreen === 'home' ? 'SYS.ONLINE' : 'ROUTE.ACTIVE'}
        </div>

        <div
          className="hero__screens"
          style={{ '--hero-content-bottom': `${contentBottom}px` } as CSSProperties}
        >
          <motion.div
            className="hero__screen hero__screen--artwork"
            animate={{ x: getScreenOffset('work', activeScreen) }}
            transition={transition}
            aria-hidden={activeScreen !== 'work'}
          >
            <TransitionScreen
              variant="work"
              active={activeScreen === 'work'}
              contentBottom={contentBottom}
            />
          </motion.div>

          <motion.div
            className="hero__screen hero__screen--artwork"
            animate={{ x: getScreenOffset('experience', activeScreen) }}
            transition={transition}
            aria-hidden={activeScreen !== 'experience'}
          >
            <TransitionScreen
              variant="experience"
              active={activeScreen === 'experience'}
              contentBottom={contentBottom}
            />
          </motion.div>
        </div>

        <div className="hero__cluster">
          <div className="hero__cluster-inner">
            <div className="hero__content-track">
              <motion.div
                className="hero__content-panel"
                animate={{
                  x: getScreenOffset('home', activeScreen),
                  opacity: activeScreen === 'home' ? 1 : 0,
                }}
                transition={transition}
                aria-hidden={activeScreen !== 'home'}
              >
                <div className="hero__content">
                  <motion.p
                    className="hero__name"
                    custom={0.35}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    {SITE_NAME}
                  </motion.p>

                  <GlitchText text="Software Engineer" as="h1" className="hero__title" />

                  <motion.p
                    className="hero__role"
                    custom={0.55}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    Full-stack engineer building web applications and AI systems.
                  </motion.p>

                  <motion.p
                    className="hero__description"
                    custom={0.7}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    Based in Sydney, Australia.
                  </motion.p>
                </div>
              </motion.div>
            </div>

            <div className="hero__nav" ref={navRef}>
              <div className="hero__nav-item">
                <button
                  type="button"
                  className={`hero__button hero__button--accent${activeScreen === 'work' ? ' hero__button--active' : ''}`}
                  onMouseEnter={() => handleNavEnter('work')}
                  onMouseLeave={handleNavLeave}
                  onFocus={() => handleNavEnter('work')}
                  onClick={() => handleNavClick('work')}
                  aria-expanded={activeScreen === 'work'}
                >
                  <span>View work</span>
                </button>
                <motion.span
                  className="hero__nav-hint"
                  initial={false}
                  animate={{ opacity: activeScreen === 'work' ? 1 : 0, y: activeScreen === 'work' ? 0 : 4 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden={activeScreen !== 'work'}
                >
                  Click me
                </motion.span>
              </div>
              <div className="hero__nav-item">
                <button
                  type="button"
                  className={`hero__button${activeScreen === 'experience' ? ' hero__button--active' : ''}`}
                  onMouseEnter={() => handleNavEnter('experience')}
                  onMouseLeave={handleNavLeave}
                  onFocus={() => handleNavEnter('experience')}
                  onClick={() => handleNavClick('experience')}
                  aria-expanded={activeScreen === 'experience'}
                >
                  <span>Experience</span>
                </button>
                <motion.span
                  className="hero__nav-hint"
                  initial={false}
                  animate={{
                    opacity: activeScreen === 'experience' ? 1 : 0,
                    y: activeScreen === 'experience' ? 0 : 4,
                  }}
                  transition={{ duration: 0.2 }}
                  aria-hidden={activeScreen !== 'experience'}
                >
                  Click me
                </motion.span>
              </div>
            </div>

            <motion.div
              className="hero__tags"
              initial={{ opacity: 0 }}
              animate={{ opacity: activeScreen === 'home' ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              aria-hidden={activeScreen !== 'home'}
            >
              {TAGS.map((tag) => (
                <span key={tag} className="hero__tag">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

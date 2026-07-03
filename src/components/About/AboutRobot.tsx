import { useInView, useReducedMotion } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import './AboutRobot.css'

const AboutRobotCanvas = lazy(() =>
  import('./AboutRobotCanvas').then((mod) => ({ default: mod.AboutRobotCanvas })),
)

type RobotPhase = 'idle' | 'glitch' | 'visible'

export function AboutRobot() {
  const reduceMotion = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(wrapRef, { once: true, margin: '-5% 0px' })
  const [phase, setPhase] = useState<RobotPhase>('idle')

  useEffect(() => {
    if (!isInView) return

    if (reduceMotion) {
      setPhase('visible')
      return
    }

    setPhase('glitch')
    const visibleTimer = window.setTimeout(() => setPhase('visible'), 850)

    return () => {
      window.clearTimeout(visibleTimer)
    }
  }, [isInView, reduceMotion])

  const awake = phase === 'visible'

  return (
    <div
      ref={wrapRef}
      className={`about-robot about-robot--${phase}`}
      aria-hidden={phase === 'idle'}
    >
      <div className="about-robot__glitch-layer" aria-hidden="true" />

      <Suspense fallback={null}>
        <AboutRobotCanvas awake={awake} />
      </Suspense>
    </div>
  )
}

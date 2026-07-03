import { motion } from 'motion/react'
import { SITE_NAME } from '../../data/site'
import { GlitchText } from './GlitchText'

const easeOut = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: easeOut },
  }),
}

export function WorkTransitionCopy() {
  return (
    <div className="hero__content-column">
      <p className="hero__name hero__name--spacer" aria-hidden="true">
        {SITE_NAME}
      </p>

      <GlitchText text="Selected work" as="h2" className="hero__title" scrambleDurationMs={800} />

      <motion.p
        className="hero__role"
        custom={0.45}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        Hackathon projects, client work, and research.
      </motion.p>
    </div>
  )
}

import { motion, useReducedMotion } from 'motion/react'
import { ABOUT_COPY, ABOUT_SKILLS } from '../../data/about'
import { GlitchText } from '../Hero/GlitchText'
import { AboutRobot } from './AboutRobot'
import './AboutSection.css'

export function AboutSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="about" className="about" aria-label="About me">
      <div className="about__bg" aria-hidden="true">
        <div className="about__grid" />
        <div className="about__scanlines" />
        <AboutRobot />
        <div className="about__art-fade" />
      </div>

      <div className="about__inner">
        <motion.header
          className="about__header"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="about__index">02 / About</span>
          <GlitchText text="About me" as="h2" className="about__title" startWhenVisible />
          <p className="about__lede">{ABOUT_COPY.lede}</p>
        </motion.header>

        <motion.div
          className="about__meta"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {ABOUT_COPY.meta.map((item) => (
            <div key={item.label} className="about__meta-item">
              <span className="about__meta-label">{item.label}</span>
              <span className="about__meta-value">{item.value}</span>
            </div>
          ))}
        </motion.div>

        {ABOUT_COPY.paragraphs.length > 0 && (
          <motion.div
            className="about__body"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {ABOUT_COPY.paragraphs.map((paragraph) => (
              <p key={paragraph} className="about__paragraph">
                {paragraph}
              </p>
            ))}
          </motion.div>
        )}

        <motion.ul
          className="about__skills"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {ABOUT_SKILLS.map((skill) => (
            <li key={skill} className="about__skill">
              {skill}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

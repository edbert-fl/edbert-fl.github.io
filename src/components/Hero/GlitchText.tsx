import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import './GlitchText.css'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/<>[]{}#@$%&'
/** Reveal pacing for letters only — spaces don't consume scramble time. */
const MS_PER_LETTER = 95

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

function letterCount(text: string) {
  return text.replace(/ /g, '').length
}

function scrambleDurationFor(text: string, minimumMs: number) {
  return Math.max(minimumMs, letterCount(text) * MS_PER_LETTER)
}

interface GlitchTextProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'span' | 'p'
  scrambleDurationMs?: number
  startWhenVisible?: boolean
}

export function GlitchText({
  text,
  className = '',
  as: Tag = 'span',
  scrambleDurationMs = 1200,
  startWhenVisible = false,
}: GlitchTextProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })
  const [display, setDisplay] = useState(text)
  const [settled, setSettled] = useState(!!reduceMotion)
  const chars = text.split('')

  useEffect(() => {
    if (startWhenVisible && !isInView) return

    if (reduceMotion) {
      setDisplay(text)
      setSettled(true)
      return
    }

    setDisplay(text)
    setSettled(false)

    const letters = letterCount(text)
    const durationMs = scrambleDurationFor(text, scrambleDurationMs)
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const revealedLetters = letters === 0 ? 0 : Math.floor(progress * letters)

      let seenLetters = 0
      const next = text
        .split('')
        .map((char) => {
          if (char === ' ') return ' '
          const revealed = seenLetters < revealedLetters
          seenLetters += 1
          return revealed ? char : randomChar()
        })
        .join('')

      setDisplay(next)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(text)
        setSettled(true)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, scrambleDurationMs, reduceMotion, startWhenVisible, isInView])

  const MotionTag = motion[Tag] as typeof motion.span
  const displayChars = display.padEnd(text.length).slice(0, text.length).split('')

  return (
    <MotionTag
      ref={ref}
      className={`glitch-text ${settled ? 'glitch-text--settled' : ''} ${className}`}
      data-text={text}
      aria-label={text}
      aria-live={settled ? 'off' : 'polite'}
      initial={{ opacity: 0 }}
      animate={{ opacity: startWhenVisible && !isInView ? 0 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="glitch-text__chars" aria-hidden="true">
        {chars.map((char, index) => {
          const glyph = displayChars[index] ?? char
          const isSpace = char === ' '
          return (
            <span
              key={`${index}-${char}`}
              className={`glitch-text__char${isSpace ? ' glitch-text__char--space' : ''}`}
            >
              <span className="glitch-text__char-sizer">{isSpace ? '\u00a0' : char}</span>
              <span className="glitch-text__char-glyph">{isSpace ? '\u00a0' : glyph}</span>
            </span>
          )
        })}
      </span>
    </MotionTag>
  )
}

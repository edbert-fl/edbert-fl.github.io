import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import './GlitchText.css'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/<>[]{}#@$%&'

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
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
  const [display, setDisplay] = useState(reduceMotion ? text : '')
  const [settled, setSettled] = useState(!!reduceMotion)

  useEffect(() => {
    if (startWhenVisible && !isInView) return

    if (reduceMotion) {
      setDisplay(text)
      setSettled(true)
      return
    }

    setDisplay('')
    setSettled(false)

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / scrambleDurationMs, 1)
      const revealed = Math.floor(progress * text.length)

      const next = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' '
          if (index < revealed) return char
          return randomChar()
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
      {display}
    </MotionTag>
  )
}

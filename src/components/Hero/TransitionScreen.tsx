import { lazy, Suspense, type CSSProperties } from 'react'
import { ExperienceTransitionCopy } from './ExperienceTransitionCopy'
import { WorkTransitionCopy } from './WorkTransitionCopy'
import './TransitionScreen.css'

const TransitionScene3D = lazy(() =>
  import('./TransitionScene3D').then((mod) => ({ default: mod.TransitionScene3D })),
)

interface TransitionScreenProps {
  variant: 'work' | 'experience'
  active: boolean
  contentBottom: number
}

export function TransitionScreen({ variant, active, contentBottom }: TransitionScreenProps) {
  if (!active) return null

  return (
    <div
      className={`transition-screen transition-screen--${variant}`}
      style={{ '--hero-content-bottom': `${contentBottom}px` } as CSSProperties}
    >
      <Suspense fallback={null}>
        <TransitionScene3D variant={variant} />
      </Suspense>
      <div className="hero__content-anchor hero__content-anchor--screen">
        {variant === 'work' && <WorkTransitionCopy />}
        {variant === 'experience' && <ExperienceTransitionCopy />}
      </div>
    </div>
  )
}

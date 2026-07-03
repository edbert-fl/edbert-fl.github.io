import { lazy, Suspense } from 'react'
import './HeroUfo.css'

const HeroUfoCanvas = lazy(() =>
  import('./HeroUfoCanvas').then((mod) => ({ default: mod.HeroUfoCanvas })),
)

export function HeroUfo() {
  return (
    <div className="hero-ufo" aria-hidden="true">
      <Suspense fallback={null}>
        <HeroUfoCanvas />
      </Suspense>
    </div>
  )
}

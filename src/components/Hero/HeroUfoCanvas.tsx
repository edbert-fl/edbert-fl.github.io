import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { HeroUfoScene } from './scenes/HeroUfoScene'

export function HeroUfoCanvas() {
  return (
    <Canvas
      className="hero-ufo__canvas"
      tabIndex={-1}
      camera={{ position: [0, 0, 4.2], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <HeroUfoScene />
      </Suspense>
    </Canvas>
  )
}

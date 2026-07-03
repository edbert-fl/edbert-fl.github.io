import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ExperienceScene } from './scenes/ExperienceScene'
import { WorkScene } from './scenes/WorkScene'
import './TransitionArtwork.css'

interface TransitionScene3DProps {
  variant: 'work' | 'experience'
}

function SceneContent({ variant }: { variant: 'work' | 'experience' }) {
  return variant === 'work' ? <WorkScene /> : <ExperienceScene />
}

export function TransitionScene3D({ variant }: TransitionScene3DProps) {
  return (
    <div
      className={`transition-artwork transition-artwork--3d transition-artwork--${variant}`}
      aria-hidden="true"
    >
      <Canvas
        className="transition-artwork__canvas"
        camera={{ position: [0, 0.2, 6.5], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <SceneContent variant={variant} />
        </Suspense>
      </Canvas>

      {variant === 'experience' && <div className="transition-artwork__scan" />}
      {variant === 'work' && (
        <>
          <div className="transition-artwork__ring transition-artwork__ring--1" />
          <div className="transition-artwork__ring transition-artwork__ring--2" />
        </>
      )}
    </div>
  )
}

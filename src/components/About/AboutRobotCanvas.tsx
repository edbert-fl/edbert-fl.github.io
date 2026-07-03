import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { AboutRobotScene } from './scenes/AboutRobotScene'

interface AboutRobotCanvasProps {
  awake: boolean
}

export function AboutRobotCanvas({ awake }: AboutRobotCanvasProps) {
  return (
    <Canvas
      className="about-robot__canvas"
      tabIndex={-1}
      camera={{ position: [1.05, 0.05, 2.5], fov: 44 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={awake ? 'always' : 'demand'}
    >
      <Suspense fallback={null}>
        <AboutRobotScene awake={awake} />
      </Suspense>
    </Canvas>
  )
}

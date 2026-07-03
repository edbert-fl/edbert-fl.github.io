import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ExperiencePipelineScene } from './scenes/ExperiencePipelineScene'

interface ExperienceCanvasProps {
  pathProgress: number
}

export function ExperienceCanvas({ pathProgress }: ExperienceCanvasProps) {
  return (
    <div className="experience__canvas-wrap" aria-hidden="true">
      <Canvas
        className="experience__canvas"
        tabIndex={-1}
        camera={{ position: [0, 0.5, 6.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <ExperiencePipelineScene pathProgress={pathProgress} />
        </Suspense>
      </Canvas>
      <div className="experience__canvas-scan" />
    </div>
  )
}

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { WorkPodiumScene } from './scenes/WorkPodiumScene'

interface WorkCanvasProps {
  scrollProgress: number
}

export function WorkCanvas({ scrollProgress }: WorkCanvasProps) {
  return (
    <div className="work__canvas-wrap" aria-hidden="true">
      <Canvas
        className="work__canvas"
        tabIndex={-1}
        camera={{ position: [0, 0.55, 5.4], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <WorkPodiumScene scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
      <div className="work__canvas-scan" />
    </div>
  )
}

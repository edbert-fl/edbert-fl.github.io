import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import type { ContactChannel } from '../../data/contact'
import { ContactConstellationScene } from './scenes/ContactConstellationScene'

interface ContactCanvasProps {
  activeChannel: ContactChannel | null
}

export function ContactCanvas({ activeChannel }: ContactCanvasProps) {
  return (
    <Canvas
      className="contact-art__canvas"
      tabIndex={-1}
      camera={{ position: [-1.55, 0.12, 4.8], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <ContactConstellationScene activeChannel={activeChannel} />
      </Suspense>
    </Canvas>
  )
}

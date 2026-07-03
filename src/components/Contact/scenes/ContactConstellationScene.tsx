import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { DoubleSide, Vector3 } from 'three'
import type { ContactChannel } from '../../../data/contact'
import { CONTACT_ACCENT, CONTACT_DIM } from './art/contactArtTheme'

interface ContactConstellationSceneProps {
  activeChannel: ContactChannel | null
}

const HUB: [number, number, number] = [2.75, 0.05, 0]

const STARS: Array<{
  id: ContactChannel
  position: [number, number, number]
}> = [
  { id: 'email', position: [1.15, 0.82, 0.08] },
  { id: 'linkedin', position: [0.95, -0.9, 0.18] },
  { id: 'github', position: [1.55, 0.12, 0.04] },
]

const BACKGROUND_STARS: Array<{
  position: [number, number, number]
  size: number
  opacity: number
}> = [
  { position: [0.85, 1.18, -0.35], size: 0.018, opacity: 0.18 },
  { position: [1.35, -0.28, -0.2], size: 0.022, opacity: 0.24 },
  { position: [1.95, 1.32, -0.45], size: 0.016, opacity: 0.16 },
  { position: [2.55, 1.1, -0.3], size: 0.02, opacity: 0.22 },
  { position: [3.15, 0.98, -0.25], size: 0.024, opacity: 0.26 },
  { position: [3.65, -0.52, -0.4], size: 0.018, opacity: 0.2 },
  { position: [1.05, -1.02, -0.15], size: 0.02, opacity: 0.19 },
  { position: [2.45, -1.15, -0.28], size: 0.016, opacity: 0.17 },
  { position: [1.75, 0.88, -0.5], size: 0.014, opacity: 0.15 },
  { position: [3.45, 0.22, -0.38], size: 0.022, opacity: 0.23 },
  { position: [2.05, -0.18, -0.42], size: 0.012, opacity: 0.14 },
  { position: [3.05, 0.38, -0.32], size: 0.018, opacity: 0.21 },
  { position: [3.85, 0.78, -0.48], size: 0.016, opacity: 0.18 },
  { position: [4.05, -0.12, -0.35], size: 0.02, opacity: 0.2 },
  { position: [3.35, -1.08, -0.22], size: 0.014, opacity: 0.16 },
  { position: [2.35, 1.48, -0.4], size: 0.018, opacity: 0.19 },
  { position: [1.55, -1.38, -0.3], size: 0.016, opacity: 0.17 },
  { position: [1.15, 0.48, -0.55], size: 0.012, opacity: 0.13 },
  { position: [2.95, -0.68, -0.45], size: 0.022, opacity: 0.22 },
  { position: [3.75, 1.28, -0.5], size: 0.014, opacity: 0.15 },
  { position: [4.25, 0.48, -0.42], size: 0.018, opacity: 0.18 },
  { position: [2.15, 0.28, -0.38], size: 0.01, opacity: 0.12 },
  { position: [2.65, -1.48, -0.25], size: 0.016, opacity: 0.16 },
  { position: [3.25, 1.58, -0.35], size: 0.02, opacity: 0.2 },
  { position: [4.1, -0.88, -0.48], size: 0.012, opacity: 0.14 },
  { position: [1.25, -0.88, -0.32], size: 0.018, opacity: 0.18 },
  { position: [3.95, -0.38, -0.28], size: 0.016, opacity: 0.17 },
  { position: [2.25, 0.68, -0.52], size: 0.014, opacity: 0.15 },
]

const IDLE_STAR_SIZE = 0.02
const IDLE_STAR_OPACITY = 0.22

function ChannelStar({
  position,
  highlighted,
}: {
  position: [number, number, number]
  highlighted: boolean
}) {
  const coreRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (coreRef.current) {
      const pulse = highlighted ? 1 + Math.sin(t * 4.5) * 0.1 : 1
      const targetScale = highlighted ? 4.5 * pulse : 1
      coreRef.current.scale.setScalar(
        coreRef.current.scale.x + (targetScale - coreRef.current.scale.x) * 0.12,
      )

      const material = coreRef.current.material
      if (material && 'opacity' in material) {
        const targetOpacity = highlighted ? 0.95 : IDLE_STAR_OPACITY
        material.opacity += (targetOpacity - material.opacity) * 0.12
      }
    }

    if (ringRef.current) {
      const ringScale = highlighted ? 1.2 + ((t * 0.8) % 1) * 0.55 : 0.01
      ringRef.current.scale.setScalar(ringScale)
      const material = ringRef.current.material
      if (material && 'opacity' in material) {
        const target = highlighted ? 0.45 - ((t * 0.8) % 1) * 0.35 : 0
        material.opacity += (target - material.opacity) * 0.12
      }
    }
  })

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.14, 0.17, 32]} />
        <meshBasicMaterial color={CONTACT_ACCENT} transparent opacity={0} side={DoubleSide} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[IDLE_STAR_SIZE, 6, 6]} />
        <meshBasicMaterial
          color={highlighted ? CONTACT_ACCENT : CONTACT_DIM}
          transparent
          opacity={IDLE_STAR_OPACITY}
        />
      </mesh>
    </group>
  )
}

function UplinkLine({
  from,
  to,
  highlighted,
}: {
  from: [number, number, number]
  to: [number, number, number]
  highlighted: boolean
}) {
  const pulseRef = useRef<Mesh>(null)
  const points = useMemo(() => [new Vector3(...from), new Vector3(...to)], [from, to])

  useFrame((state) => {
    if (!pulseRef.current) return
    const t = state.clock.elapsedTime
    const material = pulseRef.current.material
    if (!material || !('opacity' in material)) return

    if (highlighted) {
      const phase = (t * 1.4) % 1
      pulseRef.current.position.lerpVectors(points[0], points[1], phase)
      material.opacity = 0.35 + Math.sin(phase * Math.PI) * 0.65
    } else {
      material.opacity += (0 - material.opacity) * 0.15
    }
  })

  if (!highlighted) return null

  return (
    <group>
      <Line points={points} color={CONTACT_ACCENT} transparent opacity={0.72} />
      <mesh ref={pulseRef} position={from}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={CONTACT_ACCENT} transparent opacity={0} />
      </mesh>
    </group>
  )
}

export function ContactConstellationScene({ activeChannel }: ContactConstellationSceneProps) {
  const rigRef = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!rigRef.current) return
    rigRef.current.rotation.y = Math.sin(t * 0.18) * 0.06
    rigRef.current.position.y = Math.sin(t * 0.25) * 0.04
  })

  return (
    <group ref={rigRef}>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 2, 3]} intensity={0.45} color={CONTACT_ACCENT} />

      {BACKGROUND_STARS.map((star) => (
        <mesh key={star.position.join('-')} position={star.position}>
          <sphereGeometry args={[star.size, 6, 6]} />
          <meshBasicMaterial color={CONTACT_DIM} transparent opacity={star.opacity} />
        </mesh>
      ))}

      {STARS.map((star) => (
        <UplinkLine
          key={`line-${star.id}`}
          from={HUB}
          to={star.position}
          highlighted={activeChannel === star.id}
        />
      ))}

      <mesh position={HUB}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color={CONTACT_ACCENT} wireframe transparent opacity={0.55} />
      </mesh>

      {STARS.map((star) => (
        <ChannelStar
          key={star.id}
          position={star.position}
          highlighted={activeChannel === star.id}
        />
      ))}
    </group>
  )
}

import { useFrame } from '@react-three/fiber'
import { useRef, type MutableRefObject } from 'react'
import type { Group } from 'three'

const MUTED = '#a1a1aa'
const BODY = '#d4d4d8'

export interface CowMotionState {
  hidden: boolean
  offsetY: number
  explodeT: number
}

export function createCowMotion(): CowMotionState {
  return { hidden: false, offsetY: 0, explodeT: -1 }
}

interface HeroCowProps {
  index: number
  basePosition: [number, number, number]
  rotation?: number
  motionRef: MutableRefObject<CowMotionState[]>
}

export function HeroCow({ index, basePosition, rotation = 0, motionRef }: HeroCowProps) {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return

    const motion = motionRef.current[index] ?? createCowMotion()
    const exploding = motion.explodeT >= 0 && motion.explodeT < 1
    groupRef.current.visible = !motion.hidden && !exploding

    if (!groupRef.current.visible) return

    const t = state.clock.elapsedTime
    const graze = motion.offsetY < 0.02

    groupRef.current.position.set(
      basePosition[0],
      basePosition[1] + motion.offsetY + (graze ? Math.sin(t * 0.9 + basePosition[2]) * 0.012 : 0),
      basePosition[2],
    )

    if (headRef.current) {
      headRef.current.rotation.x = graze ? Math.sin(t * 1.6 + basePosition[0]) * 0.08 : -0.12
    }
  })

  return (
    <group ref={groupRef} rotation={[0, rotation, 0]}>
      <group ref={headRef} position={[0.17, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[0.11, 0.09, 0.08]} />
          <meshBasicMaterial color={BODY} wireframe transparent opacity={0.42} />
        </mesh>
        <mesh position={[0.055, 0.04, 0.03]}>
          <boxGeometry args={[0.02, 0.05, 0.02]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.35} />
        </mesh>
        <mesh position={[0.055, 0.04, -0.03]}>
          <boxGeometry args={[0.02, 0.05, 0.02]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.35} />
        </mesh>
      </group>

      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.13]} />
        <meshBasicMaterial color={BODY} wireframe transparent opacity={0.38} />
      </mesh>

      {[
        [-0.08, -0.02, 0.05],
        [-0.08, -0.02, -0.05],
        [0.1, -0.02, 0.05],
        [0.1, -0.02, -0.05],
      ].map((leg) => (
        <mesh key={leg.join('-')} position={leg as [number, number, number]}>
          <boxGeometry args={[0.04, 0.1, 0.04]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.32} />
        </mesh>
      ))}
    </group>
  )
}

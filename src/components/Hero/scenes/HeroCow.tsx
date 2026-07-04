import { useFrame } from '@react-three/fiber'
import { useRef, type MutableRefObject } from 'react'
import type { Group, Mesh } from 'three'
import { DoubleSide } from 'three'

const MUTED = '#a1a1aa'
const BODY = '#d4d4d8'
const POOF = '#e4e4e7'
const POOF_ACCENT = '#22d3ee'
const POOF_DURATION = 0.45

export interface CowMotionState {
  hidden: boolean
  offsetY: number
  explodeT: number
  poofT: number
}

export function createCowMotion(): CowMotionState {
  return { hidden: false, offsetY: 0, explodeT: -1, poofT: -1 }
}

interface HeroCowProps {
  index: number
  basePosition: [number, number, number]
  rotation?: number
  motionRef: MutableRefObject<CowMotionState[]>
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3
}

export function HeroCow({ index, basePosition, rotation = 0, motionRef }: HeroCowProps) {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)
  const poofRef = useRef<Group>(null)
  const wasHiddenRef = useRef(true)
  const ringMats = useRef<Mesh[]>([])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const motion = motionRef.current[index] ?? createCowMotion()
    const exploding = motion.explodeT >= 0 && motion.explodeT < 1
    const visible = !motion.hidden && !exploding

    if (visible && wasHiddenRef.current) {
      motion.poofT = 0
    }
    wasHiddenRef.current = !visible

    if (motion.poofT >= 0 && motion.poofT < 1) {
      motion.poofT = Math.min(1, motion.poofT + delta / POOF_DURATION)
    } else if (motion.poofT >= 1) {
      motion.poofT = -1
    }

    groupRef.current.visible = visible
    if (!visible) {
      if (poofRef.current) poofRef.current.visible = false
      return
    }

    const t = state.clock.elapsedTime
    const graze = motion.offsetY < 0.02
    const poofing = motion.poofT >= 0
    const poof = poofing ? motion.poofT : 1
    const appear = easeOut(Math.min(1, poof))

    groupRef.current.position.set(
      basePosition[0],
      basePosition[1] + motion.offsetY + (graze ? Math.sin(t * 0.9 + basePosition[2]) * 0.012 : 0),
      basePosition[2],
    )
    groupRef.current.scale.setScalar(0.15 + appear * 0.85)

    if (headRef.current) {
      headRef.current.rotation.x = graze ? Math.sin(t * 1.6 + basePosition[0]) * 0.08 : -0.12
    }

    if (poofRef.current) {
      poofRef.current.visible = poofing
      if (poofing) {
        const burst = 0.35 + easeOut(poof) * 1.4
        poofRef.current.scale.setScalar(burst)
        const fade = 1 - poof
        ringMats.current.forEach((mesh, i) => {
          const material = mesh.material
          if (material && 'opacity' in material) {
            const base = i === 0 ? 0.55 : i === 1 ? 0.4 : 0.35
            material.opacity = fade * base
          }
        })
      }
    }
  })

  return (
    <group ref={groupRef} rotation={[0, rotation, 0]}>
      <group ref={poofRef} position={[0.04, 0.08, 0]} visible={false}>
        <mesh
          ref={(mesh) => {
            if (mesh) ringMats.current[0] = mesh
          }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.12, 0.22, 16]} />
          <meshBasicMaterial color={POOF} transparent opacity={0} side={DoubleSide} />
        </mesh>
        <mesh
          ref={(mesh) => {
            if (mesh) ringMats.current[1] = mesh
          }}
          rotation={[Math.PI / 2, 0, 0.4]}
        >
          <ringGeometry args={[0.06, 0.14, 14]} />
          <meshBasicMaterial color={POOF_ACCENT} transparent opacity={0} side={DoubleSide} />
        </mesh>
        <mesh
          ref={(mesh) => {
            if (mesh) ringMats.current[2] = mesh
          }}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={POOF} wireframe transparent opacity={0} />
        </mesh>
      </group>

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

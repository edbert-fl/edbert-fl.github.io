import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { Vector3 } from 'three'
import { type NodeArtworkProps, wireOpacity } from './pipelineTheme'

const FLOW_COUNT = 4

const MAP_SECTIONS = [
  { pos: [-0.38, 0.22] as [number, number], size: [0.42, 0.32] as [number, number], phase: 0 },
  { pos: [0.05, 0.26] as [number, number], size: [0.38, 0.28] as [number, number], phase: 1.4 },
  { pos: [0.4, 0.08] as [number, number], size: [0.36, 0.38] as [number, number], phase: 2.8 },
  { pos: [-0.12, -0.08] as [number, number], size: [0.48, 0.34] as [number, number], phase: 0.9 },
  { pos: [0.28, -0.3] as [number, number], size: [0.4, 0.32] as [number, number], phase: 2.1 },
  { pos: [-0.35, -0.32] as [number, number], size: [0.38, 0.3] as [number, number], phase: 3.6 },
] as const

const MAP_DIVIDERS = [
  [
    [-0.68, 0.05],
    [-0.02, 0.12],
    [0.18, -0.42],
  ],
  [
    [-0.15, 0.42],
    [0.08, -0.05],
    [0.68, -0.08],
  ],
  [
    [-0.42, -0.12],
    [0.32, 0.02],
  ],
] as const

function CoalMine({
  active,
  color,
  dimColor,
}: {
  active: boolean
  color: string
  dimColor: string
}) {
  const glowRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!glowRef.current) return
    const material = glowRef.current.material
    if (!material || !('opacity' in material)) return
    const t = state.clock.elapsedTime
    const target = active ? 0.22 + Math.sin(t * 2.2) * 0.14 : 0.1
    material.opacity += (target - material.opacity) * 0.1
  })

  const headframe = useMemo(
    () => [
      new Vector3(-0.06, 0.1, 0.03),
      new Vector3(-0.06, 0.18, 0.03),
      new Vector3(0.06, 0.18, 0.03),
      new Vector3(0.06, 0.1, 0.03),
    ],
    [],
  )

  return (
    <group position={[-0.35, -0.32, 0.025]}>
      {[0, 1, 2, 3].map((level) => (
        <mesh key={level} position={[0, -level * 0.018, level * 0.002]}>
          <boxGeometry args={[0.24 - level * 0.045, 0.16 - level * 0.032, 0.006]} />
          <meshBasicMaterial
            color={level === 0 ? color : dimColor}
            wireframe
            transparent
            opacity={active ? 0.55 - level * 0.08 : 0.28}
          />
        </mesh>
      ))}

      <Line points={headframe} color={color} transparent opacity={active ? 0.65 : 0.35} />

      <mesh position={[0, 0.14, 0.01]}>
        <boxGeometry args={[0.02, 0.08, 0.01]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>

      {[
        [-0.08, -0.04],
        [0.06, -0.02],
        [-0.02, 0.04],
      ].map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.008]}>
          <boxGeometry args={[0.035, 0.025, 0.01]} />
          <meshBasicMaterial color={dimColor} wireframe transparent opacity={0.4} />
        </mesh>
      ))}

      <mesh ref={glowRef} position={[0, -0.02, 0.003]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 0.14]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

function LandMap({
  active,
  color,
  dimColor,
}: {
  active: boolean
  color: string
  dimColor: string
}) {
  const sectionRefs = useRef<Mesh[]>([])

  const border = useMemo(
    () => [
      new Vector3(-0.7, -0.48, 0.012),
      new Vector3(0.7, -0.48, 0.012),
      new Vector3(0.7, 0.42, 0.012),
      new Vector3(-0.7, 0.42, 0.012),
      new Vector3(-0.7, -0.48, 0.012),
    ],
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    sectionRefs.current.forEach((mesh, index) => {
      if (!mesh) return
      const material = mesh.material
      if (!material || !('opacity' in material)) return
      const phase = MAP_SECTIONS[index]?.phase ?? 0
      const wave = (Math.sin(t * 1.6 + phase) + 1) * 0.5
      const target = active ? 0.08 + wave * 0.32 : 0.04 + wave * 0.12
      material.opacity += (target - material.opacity) * 0.12
    })
  })

  return (
    <group position={[0.72, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <Line points={border} color={dimColor} transparent opacity={0.45} />

      {MAP_DIVIDERS.map((divider, index) => (
        <Line
          key={index}
          points={divider.map(([x, y]) => new Vector3(x, y, 0.012))}
          color={dimColor}
          transparent
          opacity={0.28}
        />
      ))}

      {MAP_SECTIONS.map((section, index) => (
        <mesh
          key={`${section.pos[0]}-${section.pos[1]}`}
          ref={(node) => {
            if (node) sectionRefs.current[index] = node
          }}
          position={[section.pos[0], section.pos[1], 0.008]}
        >
          <planeGeometry args={section.size} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>
      ))}

      <CoalMine active={active} color={color} dimColor={dimColor} />
    </group>
  )
}

export function AscendNodeArt({ active, color, dimColor }: NodeArtworkProps) {
  const flowRef = useRef<Group>(null)

  const pipePath = useMemo(
    () => [new Vector3(-0.55, 0.15, 0), new Vector3(0.15, 0, 0.1), new Vector3(0.65, -0.2, 0)],
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!flowRef.current) return
    flowRef.current.children.forEach((child, index) => {
      const progress = (t * (active ? 0.55 : 0.2) + index * 0.22) % 1
      child.position.lerpVectors(pipePath[0], pipePath[2], progress)
    })
  })

  return (
    <group>
      <mesh position={[-0.62, 0.18, 0]}>
        <boxGeometry args={[0.75, 0.85, 0.75]} />
        <meshBasicMaterial
          color={dimColor}
          wireframe
          transparent
          opacity={wireOpacity(active, 0.28, 0.55)}
        />
      </mesh>

      <mesh position={[-0.62, 0.18, 0]}>
        <boxGeometry args={[0.75, 0.85, 0.75]} />
        <meshBasicMaterial color={dimColor} transparent opacity={0.04} />
      </mesh>

      {[
        [0, 0.12, 0.05],
        [0.22, 0.02, 0.08],
        [0.42, -0.08, 0.04],
      ].map((pos, index) => (
        <mesh key={index} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
          <meshBasicMaterial color={color} transparent opacity={active ? 0.55 : 0.28} />
        </mesh>
      ))}

      <Line points={pipePath} color={color} transparent opacity={active ? 0.65 : 0.3} />

      <group ref={flowRef}>
        {Array.from({ length: FLOW_COUNT }, (_, index) => (
          <mesh key={index} scale={0.12}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={active ? color : dimColor} wireframe transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      <LandMap active={active} color={color} dimColor={dimColor} />
    </group>
  )
}

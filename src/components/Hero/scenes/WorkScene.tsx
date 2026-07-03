import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'

const CARD_POSITIONS: [number, number, number][] = [
  [-2.2, 1.1, -0.4],
  [0, 1.4, 0.2],
  [2.1, 0.9, -0.3],
  [-2.4, -0.5, 0.5],
  [0.1, -0.8, -0.2],
  [2.3, -0.6, 0.4],
  [-1.1, 0.2, 1.1],
  [1.2, 0.1, -1.2],
]

function ProjectCard({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}) {
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh>
          <boxGeometry args={[1.35, 0.95, 0.08]} />
          <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.35, 0.95, 0.08]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} />
        </mesh>
      </group>
    </Float>
  )
}

export function WorkScene() {
  const groupRef = useRef<Group>(null)

  const cards = useMemo(
    () =>
      CARD_POSITIONS.map((position, index) => ({
        position,
        rotation: [
          0.15 + index * 0.07,
          index * 0.45,
          0.08,
        ] as [number, number, number],
        scale: 0.85 + (index % 3) * 0.12,
      })),
    [],
  )

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.12
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 3, 5]} intensity={1.4} color="#22d3ee" />
      <pointLight position={[-4, -2, 2]} intensity={0.4} color="#ffffff" />

      <group ref={groupRef}>
        {cards.map((card, index) => (
          <ProjectCard key={index} {...card} />
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
        <planeGeometry args={[14, 14, 24, 24]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.08} />
      </mesh>
    </>
  )
}

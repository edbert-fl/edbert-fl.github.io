import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import type { Group, MeshBasicMaterial } from 'three'

const BLAST = '#fb923c'
const CORE = '#f87171'

export interface ExplosionState {
  progress: number
  position: [number, number, number]
}

interface HeroExplosionProps {
  stateRef: MutableRefObject<ExplosionState>
}

export function HeroExplosion({ stateRef }: HeroExplosionProps) {
  const groupRef = useRef<Group>(null)
  const materialsRef = useRef<MeshBasicMaterial[]>([])

  const rays = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2
        return [Math.cos(angle), Math.sin(angle) * 0.6 + 0.15, Math.sin(angle) * 0.25] as [
          number,
          number,
          number,
        ]
      }),
    [],
  )

  useFrame(() => {
    if (!groupRef.current) return

    const { progress, position } = stateRef.current
    const active = progress >= 0 && progress < 1
    groupRef.current.visible = active

    if (!active) return

    groupRef.current.position.set(position[0], position[1], position[2])
    const burst = 0.15 + progress * 0.55
    groupRef.current.scale.setScalar(burst)
    groupRef.current.rotation.y = progress * Math.PI * 0.6

    const fade = 1 - progress
    materialsRef.current.forEach((material) => {
      material.opacity = fade * (material.userData.baseOpacity as number)
    })
  })

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <ringGeometry args={[0.55, 0.72, 20]} />
        <meshBasicMaterial
          ref={(material) => {
            if (material) {
              material.userData.baseOpacity = 0.75
              materialsRef.current[0] = material
            }
          }}
          color={BLAST}
          wireframe
          transparent
          opacity={0}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial
          ref={(material) => {
            if (material) {
              material.userData.baseOpacity = 0.85
              materialsRef.current[1] = material
            }
          }}
          color={CORE}
          transparent
          opacity={0}
        />
      </mesh>
      {rays.map((dir, index) => (
        <Line
          key={index}
          points={[
            [0, 0, 0],
            [dir[0], dir[1], dir[2]],
          ]}
          color={index % 2 === 0 ? CORE : BLAST}
          lineWidth={1.2}
          transparent
          opacity={0.55}
        />
      ))}
    </group>
  )
}

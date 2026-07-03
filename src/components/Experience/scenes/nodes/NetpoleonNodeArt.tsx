import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { Vector3 } from 'three'
import { type NodeArtworkProps, wireOpacity } from './pipelineTheme'

const STAT_BLOCKS = [-0.45, -0.15, 0.15, 0.45]
const PARTNER_BLOCKS = [-0.5, -0.17, 0.16, 0.49]

const SHIELD_OUTLINE: [number, number][] = [
  [0, 0.15],
  [0.11, 0.112],
  [0.11, 0.016],
  [0.065, -0.104],
  [0, -0.13],
  [-0.065, -0.104],
  [-0.11, 0.016],
  [-0.11, 0.112],
  [0, 0.15],
]

function PadlockIcon({
  active,
  color,
  dimColor,
  opacity,
}: {
  active: boolean
  color: string
  dimColor: string
  opacity: number
}) {
  const bodyRef = useRef<Mesh>(null)
  const bodyW = 0.052
  const bodyH = 0.038
  const bodyY = -0.012
  const bodyTop = bodyY + bodyH / 2
  const shackleInset = bodyW * 0.22
  const shackleTop = 0.022

  const shacklePoints = useMemo(
    () => [
      new Vector3(-bodyW / 2 + shackleInset, bodyTop, 0.014),
      new Vector3(-bodyW / 2 + shackleInset, shackleTop, 0.014),
      new Vector3(0, shackleTop + 0.006, 0.014),
      new Vector3(bodyW / 2 - shackleInset, shackleTop, 0.014),
      new Vector3(bodyW / 2 - shackleInset, bodyTop, 0.014),
    ],
    [bodyTop, bodyW, shackleInset, shackleTop],
  )

  useFrame((state) => {
    if (!bodyRef.current) return
    const material = bodyRef.current.material
    if (material && 'opacity' in material) {
      const target = active ? 0.75 + Math.sin(state.clock.elapsedTime * 2.8) * 0.12 : 0.4
      material.opacity += (target - material.opacity) * 0.1
    }
  })

  return (
    <group position={[0, 0.004, 0.012]}>
      <Line points={shacklePoints} color={color} transparent opacity={opacity} lineWidth={1.2} />

      <mesh ref={bodyRef} position={[0, bodyY, 0]}>
        <boxGeometry args={[bodyW, bodyH, 0.008]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>

      <mesh position={[0, bodyY + 0.004, 0.005]}>
        <ringGeometry args={[0.004, 0.007, 10]} />
        <meshBasicMaterial color={dimColor} wireframe transparent opacity={active ? 0.55 : 0.3} />
      </mesh>

      <Line
        points={[
          new Vector3(0, bodyY + 0.001, 0.005),
          new Vector3(0, bodyY - 0.01, 0.005),
        ]}
        color={dimColor}
        transparent
        opacity={0.45}
        lineWidth={1}
      />
    </group>
  )
}

function SecurityShieldIcon({
  active,
  color,
  dimColor,
}: {
  active: boolean
  color: string
  dimColor: string
}) {
  const shieldPoints = useMemo(
    () => SHIELD_OUTLINE.map(([x, y]) => new Vector3(x, y, 0.01)),
    [],
  )

  const shieldOpacity = wireOpacity(active, 0.38, 0.78)

  return (
    <group position={[0.38, 0.08, 0.035]}>
      <Line points={shieldPoints} color={color} transparent opacity={shieldOpacity} />

      <PadlockIcon active={active} color={color} dimColor={dimColor} opacity={shieldOpacity} />
    </group>
  )
}

export function NetpoleonNodeArt({ active, color, dimColor }: NodeArtworkProps) {
  const ctaRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!ctaRef.current) return
    const material = ctaRef.current.material
    if (material && 'opacity' in material) {
      const target = active ? 0.7 + Math.sin(state.clock.elapsedTime * 2.5) * 0.15 : 0.35
      material.opacity += (target - material.opacity) * 0.08
    }
  })

  return (
    <group rotation={[0.12, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.45, 0.95, 0.04]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={wireOpacity(active, 0.34, 0.72)} />
      </mesh>

      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[1.25, 0.75, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.05 : 0.02} />
      </mesh>

      <mesh position={[0, 0.38, 0.03]}>
        <boxGeometry args={[1.2, 0.07, 0.01]} />
        <meshBasicMaterial color={dimColor} wireframe transparent opacity={0.4} />
      </mesh>

      <mesh position={[-0.48, 0.38, 0.035]}>
        <boxGeometry args={[0.14, 0.035, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {[0.22, 0.1, -0.02].map((y, index) => (
        <mesh key={index} position={[-0.35, y, 0.035]}>
          <boxGeometry args={[0.55 - index * 0.08, 0.03, 0.01]} />
          <meshBasicMaterial color={index === 0 ? color : dimColor} transparent opacity={active ? 0.55 : 0.28} />
        </mesh>
      ))}

      <SecurityShieldIcon active={active} color={color} dimColor={dimColor} />

      {STAT_BLOCKS.map((x) => (
        <group key={x} position={[x, -0.18, 0.04]}>
          <mesh>
            <boxGeometry args={[0.22, 0.2, 0.02]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={active ? 0.5 : 0.28} />
          </mesh>
          <mesh position={[0, 0.04, 0.015]}>
            <boxGeometry args={[0.1, 0.04, 0.01]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 0.65 : 0.35} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -0.38, 0.035]}>
        <boxGeometry args={[1.05, 0.05, 0.01]} />
        <meshBasicMaterial color={dimColor} transparent opacity={0.35} />
      </mesh>

      {PARTNER_BLOCKS.map((x) => (
        <mesh key={x} position={[x, -0.5, 0.04]}>
          <boxGeometry args={[0.2, 0.1, 0.015]} />
          <meshBasicMaterial color={dimColor} wireframe transparent opacity={0.32} />
        </mesh>
      ))}

      <mesh ref={ctaRef} position={[0.35, -0.68, 0.045]}>
        <boxGeometry args={[0.32, 0.1, 0.015]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>

      <Line
        points={[new Vector3(-0.7, 0.38, 0.04), new Vector3(0.7, 0.38, 0.04)]}
        color={dimColor}
        transparent
        opacity={0.3}
      />
    </group>
  )
}

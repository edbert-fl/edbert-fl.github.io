import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3 } from 'three'
import type { Mesh } from 'three'
import { type NodeArtworkProps, wireOpacity } from './pipelineTheme'

/** Classic isometric tilt; drawn flat. Parent FaceCamera handles orientation. */
const ISO_ROTATION: [number, number, number] = [0.35, 0, 0]

const EYE_OUTLINE = [
  new Vector3(-0.62, 0, 0),
  new Vector3(-0.28, 0.32, 0),
  new Vector3(0.28, 0.32, 0),
  new Vector3(0.62, 0, 0),
  new Vector3(0.28, -0.32, 0),
  new Vector3(-0.28, -0.32, 0),
  new Vector3(-0.62, 0, 0),
]

const UPPER_LID = [
  new Vector3(-0.58, 0.04, 0.02),
  new Vector3(-0.2, 0.36, 0.02),
  new Vector3(0.2, 0.36, 0.02),
  new Vector3(0.58, 0.04, 0.02),
]

const LOWER_LID = [
  new Vector3(-0.58, -0.04, 0.02),
  new Vector3(-0.2, -0.34, 0.02),
  new Vector3(0.2, -0.34, 0.02),
  new Vector3(0.58, -0.04, 0.02),
]

export function UsydNodeArt({ active, color, dimColor }: NodeArtworkProps) {
  const scanRef = useRef<Mesh>(null)
  const scanProgress = useRef(0)

  const scanWidth = useMemo(() => 1.15, [])

  useFrame((_state, delta) => {
    const speed = active ? 0.7 : 0.28
    scanProgress.current = (scanProgress.current + delta * speed) % 2
    const phase = scanProgress.current <= 1 ? scanProgress.current : 2 - scanProgress.current
    const scanY = (phase - 0.5) * 0.62

    if (!scanRef.current) return
    scanRef.current.position.y = scanY
    const material = scanRef.current.material
    if (material && 'opacity' in material) {
      const target = active ? 0.75 : 0.32
      material.opacity += (target - material.opacity) * 0.12
    }
  })

  return (
    <group rotation={ISO_ROTATION}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.35, 0.78]} />
        <meshBasicMaterial color={dimColor} transparent opacity={active ? 0.06 : 0.03} />
      </mesh>

      <Line
        points={EYE_OUTLINE}
        color={color}
        transparent
        opacity={wireOpacity(active, 0.38, 0.78)}
      />
      <Line points={UPPER_LID} color={dimColor} transparent opacity={active ? 0.5 : 0.28} />
      <Line points={LOWER_LID} color={dimColor} transparent opacity={active ? 0.5 : 0.28} />

      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={wireOpacity(active, 0.42, 0.8)}
        />
      </mesh>

      <mesh position={[0, 0, 0.03]}>
        <ringGeometry args={[0.14, 0.22, 32]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.18 : 0.08} />
      </mesh>

      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.1, 24]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.85 : 0.45} />
      </mesh>

      <mesh
        ref={scanRef}
        position={[0, 0, 0.05]}
        scale={[scanWidth, 0.018, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>

      <Line
        points={[new Vector3(-0.7, 0, 0.06), new Vector3(0.7, 0, 0.06)]}
        color={dimColor}
        transparent
        opacity={active ? 0.35 : 0.18}
      />
      <Line
        points={[new Vector3(0, -0.45, 0.06), new Vector3(0, 0.45, 0.06)]}
        color={dimColor}
        transparent
        opacity={active ? 0.35 : 0.18}
      />
    </group>
  )
}

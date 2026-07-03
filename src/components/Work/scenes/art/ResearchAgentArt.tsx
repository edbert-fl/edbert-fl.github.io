import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { MathUtils, Vector3 } from 'three'
import { WORK_ACCENT, WORK_ART_LIFT, WORK_ART_VISUAL_CENTER_Y, WORK_MUTED, type WorkArtProps, workWireOpacity } from './workArtTheme'

const PAGE_WIDTH = 0.78
const PAGE_HEIGHT = 0.54
const LENS_RADIUS = 0.19
const HANDLE_RADIUS = 0.025
const HANDLE_LENGTH = 0.24
const HANDLE_ANGLE = -0.34

const HANDLE_OFFSET_X = -0.045
const GLASS_BASE_Y = 0.17
const GLASS_SCAN_AMP = 0.03

function MagnifyingGlass({
  active,
  wireOpacity,
}: {
  active: boolean
  wireOpacity: number
}) {
  const rimOpacity = active ? 0.88 : 0.5
  const glassOpacity = active ? 0.12 : 0.05
  const handleHalf = HANDLE_LENGTH * 0.5 + HANDLE_RADIUS

  return (
    <group position={[0, 0, 0.1]}>
      <mesh>
        <torusGeometry args={[LENS_RADIUS, 0.02, 12, 40]} />
        <meshBasicMaterial color={WORK_ACCENT} wireframe transparent opacity={rimOpacity} />
      </mesh>
      <mesh>
        <torusGeometry args={[LENS_RADIUS, 0.02, 12, 40]} />
        <meshBasicMaterial color={WORK_ACCENT} transparent opacity={glassOpacity * 0.35} />
      </mesh>

      <mesh>
        <circleGeometry args={[LENS_RADIUS - 0.024, 36]} />
        <meshBasicMaterial color={WORK_ACCENT} transparent opacity={glassOpacity} depthWrite={false} />
      </mesh>

      <mesh>
        <ringGeometry args={[LENS_RADIUS - 0.03, LENS_RADIUS - 0.019, 36]} />
        <meshBasicMaterial color={WORK_MUTED} transparent opacity={wireOpacity * 0.5} />
      </mesh>

      <group position={[HANDLE_OFFSET_X, -LENS_RADIUS, 0.02]}>
        <mesh>
          <sphereGeometry args={[HANDLE_RADIUS * 1.45, 10, 10]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity} />
        </mesh>

        <group rotation={[0, 0, HANDLE_ANGLE]}>
          <mesh position={[0, -handleHalf, 0]}>
            <capsuleGeometry args={[HANDLE_RADIUS, HANDLE_LENGTH, 6, 12]} />
            <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={active ? 0.72 : 0.4} />
          </mesh>
          <mesh position={[0, -handleHalf * 2 + HANDLE_RADIUS * 0.5, 0]}>
            <sphereGeometry args={[HANDLE_RADIUS * 1.1, 10, 10]} />
            <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export function ResearchAgentArt({ active }: WorkArtProps) {
  const groupRef = useRef<Group>(null)
  const glassRef = useRef<Group>(null)
  const highlightRef = useRef<Mesh>(null)
  const glassScaleRef = useRef(1)

  const contentLines = useMemo(
    () =>
      [-0.08, -0.02, 0.04, 0.1].map(
        (y) => [new Vector3(-0.26, y, 0.03), new Vector3(0.26, y, 0.03)] as [Vector3, Vector3],
      ),
    [],
  )

  const leadDots = useMemo(
    () =>
      [
        [-0.16, -0.1],
        [-0.04, -0.14],
        [0.08, -0.08],
        [0.18, -0.12],
        [-0.1, 0.02],
        [0.14, 0.04],
      ] as [number, number][],
    [],
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      const bob = active ? Math.sin(t * 1.2) * 0.012 : 0
      groupRef.current.position.y = WORK_ART_LIFT + bob
    }

    const targetScale = active ? 1.4 : 1
    glassScaleRef.current += (targetScale - glassScaleRef.current) * Math.min(1, delta * 2.8)

    if (glassRef.current) {
      const scanX = active ? Math.sin(t * 0.85) * 0.1 : 0.04
      const scanY = active
        ? GLASS_BASE_Y + 0.02 + Math.sin(t * 0.65) * GLASS_SCAN_AMP
        : GLASS_BASE_Y
      glassRef.current.position.x = MathUtils.lerp(glassRef.current.position.x, scanX, 0.08)
      glassRef.current.position.y = MathUtils.lerp(glassRef.current.position.y, scanY, 0.08)
      const s = glassScaleRef.current
      glassRef.current.scale.set(s, s, s)
    }

    if (highlightRef.current) {
      const material = highlightRef.current.material
      if (material && 'opacity' in material) {
        const pulse = active ? 0.8 + Math.sin(t * 4) * 0.15 : 0.2
        material.opacity += (pulse - material.opacity) * 0.12
      }
    }
  })

  const wireOpacity = workWireOpacity(active, 0.3, 0.68)

  return (
    <group ref={groupRef}>
      <group position={[0, WORK_ART_VISUAL_CENTER_Y, 0]}>
        <mesh>
          <boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 0.04]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity} />
        </mesh>
        <mesh>
          <boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 0.04]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.04 : 0.015} />
        </mesh>

        <mesh position={[0, PAGE_HEIGHT * 0.5 - 0.05, 0.025]}>
          <boxGeometry args={[PAGE_WIDTH, 0.08, 0.02]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity * 0.85} />
        </mesh>

        {[-0.28, -0.24, -0.2].map((x) => (
          <mesh key={x} position={[x, PAGE_HEIGHT * 0.5 - 0.05, 0.04]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.7 : 0.35} />
          </mesh>
        ))}

        <mesh position={[0.04, PAGE_HEIGHT * 0.5 - 0.05, 0.04]}>
          <boxGeometry args={[0.34, 0.025, 0.01]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity * 0.6} />
        </mesh>

        {contentLines.map((points, index) => (
          <Line
            key={index}
            points={points}
            color={WORK_MUTED}
            transparent
            opacity={active ? 0.35 : 0.18}
          />
        ))}

        {leadDots.map(([x, y], index) => (
          <mesh key={index} position={[x, y, 0.035]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshBasicMaterial color={WORK_MUTED} transparent opacity={active ? 0.45 : 0.22} />
          </mesh>
        ))}
      </group>

      <group ref={glassRef} position={[0.04, GLASS_BASE_Y, 0]}>
        <MagnifyingGlass active={active} wireOpacity={wireOpacity} />

        <mesh ref={highlightRef} position={[0.03, 0.02, 0.12]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={0.2} depthWrite={false} />
        </mesh>

        <mesh position={[0.03, 0.02, 0.11]} scale={active ? 1.35 : 1.15}>
          <sphereGeometry args={[0.014, 6, 6]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.55 : 0.25} />
        </mesh>
      </group>
    </group>
  )
}

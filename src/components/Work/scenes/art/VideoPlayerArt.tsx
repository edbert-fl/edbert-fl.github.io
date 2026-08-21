import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { MathUtils, Vector3 } from 'three'
import {
  WORK_ACCENT,
  WORK_ART_LIFT,
  WORK_ART_VISUAL_CENTER_Y,
  WORK_MUTED,
  type WorkArtProps,
  workWireOpacity,
} from './workArtTheme'

const SCREEN_W = 0.92
const SCREEN_H = 0.56
const BEZEL = 0.04
const STAND_H = 0.14

function playTriangle(size: number, z: number) {
  const h = size * 0.866
  return [
    new Vector3(-size * 0.35, size * 0.5, z),
    new Vector3(-size * 0.35, -size * 0.5, z),
    new Vector3(h * 0.55, 0, z),
    new Vector3(-size * 0.35, size * 0.5, z),
  ]
}

export function VideoPlayerArt({ active }: WorkArtProps) {
  const groupRef = useRef<Group>(null)
  const playRef = useRef<Group>(null)
  const progressRef = useRef<Mesh>(null)
  const scrubRef = useRef<Mesh>(null)
  const pulseRef = useRef(0)

  const wireOpacity = workWireOpacity(active)
  const playOutline = useMemo(() => playTriangle(0.22, 0.06), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      const bob = active ? Math.sin(t * 1.5) * 0.02 : 0
      groupRef.current.position.y = WORK_ART_LIFT + bob
    }

    pulseRef.current = MathUtils.lerp(pulseRef.current, active ? 1 : 0, Math.min(1, delta * 4))

    if (playRef.current) {
      const scale = 0.92 + pulseRef.current * (0.12 + Math.sin(t * 3.2) * 0.04)
      playRef.current.scale.setScalar(scale)
    }

    if (progressRef.current && scrubRef.current) {
      const fill = active ? 0.28 + ((Math.sin(t * 0.7) + 1) * 0.5) * 0.45 : 0.22
      progressRef.current.scale.x = Math.max(0.04, fill)
      progressRef.current.position.x = -SCREEN_W * 0.5 + 0.08 + (SCREEN_W - 0.16) * fill * 0.5
      scrubRef.current.position.x = -SCREEN_W * 0.5 + 0.08 + (SCREEN_W - 0.16) * fill
    }
  })

  const screenY = WORK_ART_VISUAL_CENTER_Y + 0.06

  return (
    <group ref={groupRef}>
      <group position={[0, screenY, 0]}>
        {/* Outer bezel */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[SCREEN_W + BEZEL * 2, SCREEN_H + BEZEL * 2, 0.06]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity} />
        </mesh>

        {/* Screen face */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[SCREEN_W, SCREEN_H, 0.02]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.08 : 0.03} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[SCREEN_W, SCREEN_H, 0.02]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity * 0.75} />
        </mesh>

        {/* Play button */}
        <group ref={playRef} position={[0, 0.04, 0.05]}>
          <mesh>
            <circleGeometry args={[0.16, 28]} />
            <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.14 : 0.05} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.14, 0.17, 28]} />
            <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.85 : 0.4} />
          </mesh>
          <Line points={playOutline} color={WORK_ACCENT} transparent opacity={active ? 0.95 : 0.5} />
        </group>

        {/* Progress bar */}
        <mesh position={[0, -SCREEN_H * 0.5 + 0.08, 0.04]}>
          <boxGeometry args={[SCREEN_W - 0.16, 0.018, 0.01]} />
          <meshBasicMaterial color={WORK_MUTED} transparent opacity={wireOpacity * 0.45} />
        </mesh>
        <mesh ref={progressRef} position={[0, -SCREEN_H * 0.5 + 0.08, 0.045]} scale={[0.22, 1, 1]}>
          <boxGeometry args={[SCREEN_W - 0.16, 0.018, 0.01]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.8 : 0.35} />
        </mesh>
        <mesh ref={scrubRef} position={[0, -SCREEN_H * 0.5 + 0.08, 0.05]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.95 : 0.4} />
        </mesh>

        {/* Stand */}
        <mesh position={[0, -SCREEN_H * 0.5 - BEZEL - STAND_H * 0.35, 0]}>
          <boxGeometry args={[0.1, STAND_H, 0.06]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity * 0.7} />
        </mesh>
        <mesh position={[0, -SCREEN_H * 0.5 - BEZEL - STAND_H * 0.75, 0]}>
          <boxGeometry args={[0.36, 0.04, 0.18]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity * 0.65} />
        </mesh>
      </group>
    </group>
  )
}

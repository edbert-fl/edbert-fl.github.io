import { Billboard, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { Vector3 } from 'three'
import {
  WORK_ACCENT,
  WORK_ART_LIFT,
  type WorkArtProps,
  workWireOpacity,
} from './workArtTheme'

const COIN_RADIUS = 0.52
const COIN_THICKNESS = 0.05
const FLIP_TURNS = 2

function circlePoints(radius: number, segments: number, z: number) {
  const points: Vector3[] = []
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2
    points.push(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z))
  }
  return points
}

function arcPoints(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number,
  z: number,
) {
  const points: Vector3[] = []
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    const angle = startAngle + (endAngle - startAngle) * t
    points.push(new Vector3(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, z))
  }
  return points
}

function CoinLogo({ z, opacity }: { z: number; opacity: number }) {
  const radius = COIN_RADIUS * 0.38
  const gap = 0.72
  const innerR = radius * 0.52

  const outerArc = useMemo(
    () => arcPoints(0, 0, radius, gap, Math.PI * 2 - gap, 32, z),
    [radius, z],
  )

  const innerArc = useMemo(
    () => arcPoints(0, 0, innerR, gap + 0.06, Math.PI * 2 - gap - 0.06, 24, z),
    [innerR, z],
  )

  const topSerif = useMemo(() => {
    const a = gap
    return [
      new Vector3(Math.cos(a) * radius, Math.sin(a) * radius, z),
      new Vector3(Math.cos(a) * innerR, Math.sin(a) * innerR, z),
    ]
  }, [radius, innerR, gap, z])

  const bottomSerif = useMemo(() => {
    const a = Math.PI * 2 - gap
    return [
      new Vector3(Math.cos(a) * radius, Math.sin(a) * radius, z),
      new Vector3(Math.cos(a) * innerR, Math.sin(a) * innerR, z),
    ]
  }, [radius, innerR, gap, z])

  return (
    <group>
      <Line points={outerArc} color={WORK_ACCENT} transparent opacity={opacity} />
      <Line points={innerArc} color={WORK_ACCENT} transparent opacity={opacity * 0.85} />
      <Line points={topSerif} color={WORK_ACCENT} transparent opacity={opacity * 0.9} />
      <Line points={bottomSerif} color={WORK_ACCENT} transparent opacity={opacity * 0.9} />
    </group>
  )
}

const COIN_RIM_OUTER = COIN_RADIUS * 0.98
const COIN_RIM_INNER = COIN_RADIUS * 0.88
const COIN_RIM_LINES = 56

function CoinRimLines({ z, opacity }: { z: number; opacity: number }) {
  const lines = useMemo(() => {
    return Array.from({ length: COIN_RIM_LINES }, (_, i) => {
      const angle = (i / COIN_RIM_LINES) * Math.PI * 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return [
        new Vector3(cos * COIN_RIM_OUTER, sin * COIN_RIM_OUTER, z),
        new Vector3(cos * COIN_RIM_INNER, sin * COIN_RIM_INNER, z),
      ]
    })
  }, [z])

  return (
    <>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={WORK_ACCENT}
          transparent
          opacity={opacity * 0.65}
        />
      ))}
    </>
  )
}

function CoinFace({ z, opacity }: { z: number; opacity: number }) {
  const outer = useMemo(() => circlePoints(COIN_RADIUS * 0.98, 40, z), [z])
  const inner = useMemo(() => circlePoints(COIN_RADIUS * 0.72, 32, z), [z])

  return (
    <group>
      <CoinRimLines z={z + 0.0005} opacity={opacity} />
      <Line points={outer} color={WORK_ACCENT} transparent opacity={opacity} />
      <Line points={inner} color={WORK_ACCENT} transparent opacity={opacity * 0.7} />
      <CoinLogo z={z + 0.001} opacity={opacity} />
    </group>
  )
}

export function CoinArt({ active }: WorkArtProps) {
  const groupRef = useRef<Group>(null)
  const flipRef = useRef<Group>(null)
  const flipProgressRef = useRef(0)

  const wireOpacity = workWireOpacity(active)
  const frontZ = COIN_THICKNESS / 2
  const backZ = -COIN_THICKNESS / 2

  const edgeAngles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2),
    [],
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      const bob = active ? Math.sin(t * 1.5) * 0.02 : 0
      groupRef.current.position.y = WORK_ART_LIFT + bob
    }

    const targetFlip = active ? 1 : 0
    flipProgressRef.current += (targetFlip - flipProgressRef.current) * Math.min(1, delta * 2.6)

    if (flipRef.current) {
      flipRef.current.rotation.x = flipProgressRef.current * Math.PI * 2 * FLIP_TURNS
    }
  })

  const faceOpacity = active ? 0.92 : 0.55

  return (
    <group ref={groupRef}>
      <Billboard>
        <group ref={flipRef}>
          <CoinFace z={frontZ} opacity={faceOpacity} />
          <CoinFace z={backZ} opacity={faceOpacity * 0.8} />

          {edgeAngles.map((angle) => {
            const x = Math.cos(angle) * COIN_RADIUS
            const y = Math.sin(angle) * COIN_RADIUS
            return (
              <Line
                key={angle}
                points={[
                  new Vector3(x, y, frontZ),
                  new Vector3(x, y, backZ),
                ]}
                color={WORK_ACCENT}
                transparent
                opacity={wireOpacity * 0.55}
              />
            )
          })}
        </group>
      </Billboard>
    </group>
  )
}

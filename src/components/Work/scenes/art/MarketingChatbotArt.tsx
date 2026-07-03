import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { Quaternion, Vector3 } from 'three'
import {
  WORK_ACCENT,
  WORK_ART_LIFT,
  WORK_ART_VISUAL_CENTER_Y,
  WORK_MUTED,
  type WorkArtProps,
  workWireOpacity,
} from './workArtTheme'

const HEADSET_BLUE = '#38bdf8'
const ROBOT_CENTER_Y = 0.38
const Y_AXIS = new Vector3(0, 1, 0)

const HEAD_Y = 0.56
const HEAD_HEIGHT = 0.36
const TORSO_Y = 0.24
const TORSO_H = 0.42
const TORSO_TOP = TORSO_Y + TORSO_H / 2
const TORSO_BOTTOM = TORSO_Y - TORSO_H / 2

const L_SHOULDER: [number, number, number] = [-0.27, TORSO_TOP - 0.05, 0.06]
const R_SHOULDER: [number, number, number] = [0.27, TORSO_TOP - 0.05, 0.06]
const L_HAND: [number, number, number] = [-0.4, 0.12, 0.1]
const R_HAND: [number, number, number] = [0.4, 0.12, 0.2]

const L_HIP: [number, number, number] = [-0.17, TORSO_BOTTOM - 0.01, 0.08]
const R_HIP: [number, number, number] = [0.17, TORSO_BOTTOM - 0.01, 0.08]
const L_ANKLE: [number, number, number] = [-0.3, -0.035, 0.52]
const R_ANKLE: [number, number, number] = [0.3, -0.035, 0.52]

function LimbSegment({
  from,
  to,
  thickness,
  opacity,
}: {
  from: [number, number, number]
  to: [number, number, number]
  thickness: number
  opacity: number
}) {
  const transform = useMemo(() => {
    const start = new Vector3(...from)
    const end = new Vector3(...to)
    const mid = start.clone().add(end).multiplyScalar(0.5)
    const dir = end.clone().sub(start)
    const length = dir.length()
    const quaternion = new Quaternion().setFromUnitVectors(Y_AXIS, dir.normalize())
    return {
      position: [mid.x, mid.y, mid.z] as [number, number, number],
      quaternion,
      length,
    }
  }, [from, to])

  return (
    <mesh position={transform.position} quaternion={transform.quaternion}>
      <boxGeometry args={[thickness, transform.length, thickness]} />
      <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={opacity} />
    </mesh>
  )
}

function RobotEyes({ active }: { active: boolean }) {
  const openRef = useRef(0)
  const leftPupilRef = useRef<Mesh>(null)
  const rightPupilRef = useRef<Mesh>(null)
  const leftEyeRef = useRef<Mesh>(null)
  const rightEyeRef = useRef<Mesh>(null)
  const leftLidRef = useRef<Group>(null)
  const rightLidRef = useRef<Group>(null)

  const leftClosed = useMemo(
    () => [
      new Vector3(-0.19, HEAD_Y + 0.06, 0.27),
      new Vector3(-0.09, HEAD_Y + 0.06, 0.27),
    ],
    [],
  )

  const rightClosed = useMemo(
    () => [
      new Vector3(0.09, HEAD_Y + 0.06, 0.27),
      new Vector3(0.19, HEAD_Y + 0.06, 0.27),
    ],
    [],
  )

  useFrame((_, delta) => {
    const target = active ? 1 : 0
    openRef.current += (target - openRef.current) * Math.min(1, delta * 3.2)
    const open = openRef.current
    const eyeScale = 0.05 + open * 0.95
    const eyeOpacity = 0.15 + open * 0.75
    const pupilOpacity = open * 0.95

    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScale
      const material = leftEyeRef.current.material
      if (material && 'opacity' in material) material.opacity = eyeOpacity
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = eyeScale
      const material = rightEyeRef.current.material
      if (material && 'opacity' in material) material.opacity = eyeOpacity
    }
    if (leftPupilRef.current) {
      leftPupilRef.current.scale.setScalar(0.2 + open * 0.8)
      const material = leftPupilRef.current.material
      if (material && 'opacity' in material) material.opacity = pupilOpacity
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.scale.setScalar(0.2 + open * 0.8)
      const material = rightPupilRef.current.material
      if (material && 'opacity' in material) material.opacity = pupilOpacity
    }
    if (leftLidRef.current) {
      leftLidRef.current.visible = open < 0.92
      leftLidRef.current.traverse((child) => {
        if (!('material' in child)) return
        const mesh = child as Mesh
        const material = mesh.material
        if (material && 'opacity' in material) {
          material.opacity = (1 - open) * 0.7
        }
      })
    }
    if (rightLidRef.current) {
      rightLidRef.current.visible = open < 0.92
      rightLidRef.current.traverse((child) => {
        if (!('material' in child)) return
        const mesh = child as Mesh
        const material = mesh.material
        if (material && 'opacity' in material) {
          material.opacity = (1 - open) * 0.7
        }
      })
    }
  })

  return (
    <>
      <group ref={leftLidRef}>
        <Line points={leftClosed} color={WORK_ACCENT} transparent opacity={0.7} />
      </group>
      <group ref={rightLidRef}>
        <Line points={rightClosed} color={WORK_ACCENT} transparent opacity={0.7} />
      </group>

      <mesh ref={leftEyeRef} position={[-0.14, HEAD_Y + 0.06, 0.26]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={WORK_ACCENT} wireframe transparent opacity={0.15} />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.14, HEAD_Y + 0.06, 0.26]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={WORK_ACCENT} wireframe transparent opacity={0.15} />
      </mesh>
      <mesh ref={leftPupilRef} position={[-0.14, HEAD_Y + 0.06, 0.28]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={WORK_ACCENT} transparent opacity={0} />
      </mesh>
      <mesh ref={rightPupilRef} position={[0.14, HEAD_Y + 0.06, 0.28]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={WORK_ACCENT} transparent opacity={0} />
      </mesh>
    </>
  )
}

function Headset({ active, wireOpacity }: { active: boolean; wireOpacity: number }) {
  const cupOpacity = active ? 0.88 : 0.45
  const bandOpacity = active ? 0.82 : 0.4

  const bandPoints = useMemo(() => {
    const points: Vector3[] = []
    for (let i = 0; i <= 18; i += 1) {
      const t = (i / 18) * Math.PI
      points.push(
        new Vector3(
          Math.sin(t) * 0.3,
          HEAD_Y + 0.16 + Math.cos(t) * 0.05,
          0.02,
        ),
      )
    }
    return points
  }, [])

  const micPoints = useMemo(
    () => [
      new Vector3(0.28, HEAD_Y + 0.02, 0.1),
      new Vector3(0.36, HEAD_Y - 0.04, 0.14),
      new Vector3(0.4, HEAD_Y - 0.08, 0.16),
    ],
    [],
  )

  return (
    <group>
      <Line points={bandPoints} color={HEADSET_BLUE} transparent opacity={bandOpacity} />

      <mesh position={[-0.3, HEAD_Y + 0.02, 0.02]}>
        <boxGeometry args={[0.1, 0.14, 0.1]} />
        <meshBasicMaterial color={HEADSET_BLUE} wireframe transparent opacity={cupOpacity} />
      </mesh>
      <mesh position={[0.3, HEAD_Y + 0.02, 0.02]}>
        <boxGeometry args={[0.1, 0.14, 0.1]} />
        <meshBasicMaterial color={HEADSET_BLUE} wireframe transparent opacity={cupOpacity} />
      </mesh>

      <Line points={micPoints} color={HEADSET_BLUE} transparent opacity={wireOpacity * 0.85} />
      <mesh position={[0.4, HEAD_Y - 0.08, 0.16]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color={HEADSET_BLUE} transparent opacity={active ? 0.95 : 0.5} />
      </mesh>
    </group>
  )
}

export function MarketingChatbotArt({ active }: WorkArtProps) {
  const groupRef = useRef<Group>(null)
  const robotRef = useRef<Group>(null)

  const mouth = useMemo(
    () => [
      new Vector3(-0.1, HEAD_Y - 0.06, 0.24),
      new Vector3(0.1, HEAD_Y - 0.06, 0.24),
    ],
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      const bob = active ? Math.sin(t * 1.2) * 0.01 : 0
      groupRef.current.position.y = WORK_ART_LIFT + bob
    }
    if (robotRef.current) {
      const wiggle = active ? Math.sin(t * 0.5) * 0.03 : Math.sin(t * 0.25) * 0.015
      robotRef.current.rotation.y = wiggle
    }
  })

  const wireOpacity = workWireOpacity(active, 0.32, 0.7)
  const bodyOpacity = wireOpacity * 0.48
  const limbOpacity = bodyOpacity * 0.88

  return (
    <group ref={groupRef}>
      <group ref={robotRef} position={[0, WORK_ART_VISUAL_CENTER_Y - ROBOT_CENTER_Y, 0]}>
        <Headset active={active} wireOpacity={wireOpacity} />

        <mesh position={[0, HEAD_Y, 0]}>
          <boxGeometry args={[0.58, HEAD_HEIGHT, 0.48]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyOpacity * 1.15} />
        </mesh>
        <mesh position={[0, HEAD_Y, 0]}>
          <boxGeometry args={[0.58, HEAD_HEIGHT, 0.48]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={active ? 0.04 : 0.015} />
        </mesh>

        <RobotEyes active={active} />

        <Line points={mouth} color={WORK_ACCENT} transparent opacity={active ? 0.72 : 0.32} />

        <mesh position={[0, TORSO_Y, 0]}>
          <boxGeometry args={[0.5, TORSO_H, 0.38]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyOpacity} />
        </mesh>

        <LimbSegment from={L_SHOULDER} to={L_HAND} thickness={0.1} opacity={limbOpacity} />
        <LimbSegment from={R_SHOULDER} to={R_HAND} thickness={0.1} opacity={limbOpacity} />

        <LimbSegment from={L_HIP} to={L_ANKLE} thickness={0.11} opacity={limbOpacity} />
        <LimbSegment from={R_HIP} to={R_ANKLE} thickness={0.11} opacity={limbOpacity} />
      </group>
    </group>
  )
}

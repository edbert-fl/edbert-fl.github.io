import { Line, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { Vector3 } from 'three'
import { WORK_ACCENT, WORK_ART_LIFT, WORK_ART_VISUAL_CENTER_Y, WORK_MUTED, type WorkArtProps, workWireOpacity } from './workArtTheme'

const SCANNER_MIN = new Vector3(-0.52, 0.18, -0.2)
const SCANNER_MAX = new Vector3(0.6, 0.96, 0.2)
const SCANNER_CENTER = new Vector3(0.04, 0.57, 0)
const SCANNER_SIZE = new Vector3(1.12, 0.78, 0.4)
const ACCURACY_MIN = 85
const ACCURACY_MAX = 92

const LEG_SIDE_OFFSET = 0.13
const LEG_HOOF_Y = 0.24
const FRONT_ATTACH_X = 0.1
const FRONT_ATTACH_Y = 0.62
const BACK_ATTACH_X = -0.3
const BACK_ATTACH_Y = 0.6
const BELLY_Y = 0.5
const BODY_DEPTH = 0.3
const COW_LOCAL_CENTER_Y = 0.57
const WALK_SPEED = 2.4
const STRIDE_AMP = 0.055
const FRONT_STANCE_OFFSET = 0.05
const BACK_STANCE_OFFSET = -0.025

/** 0 = front-left + back-right, 1 = front-right + back-left */
type GaitGroup = 0 | 1

interface LegConfig {
  id: string
  attachX: number
  attachY: number
  z: number
  gaitGroup: GaitGroup
  isFront: boolean
}

const LEG_CONFIGS: LegConfig[] = [
  {
    id: 'frontLeft',
    attachX: FRONT_ATTACH_X,
    attachY: FRONT_ATTACH_Y,
    z: LEG_SIDE_OFFSET,
    gaitGroup: 0,
    isFront: true,
  },
  {
    id: 'frontRight',
    attachX: FRONT_ATTACH_X,
    attachY: FRONT_ATTACH_Y,
    z: -LEG_SIDE_OFFSET,
    gaitGroup: 1,
    isFront: true,
  },
  {
    id: 'backLeft',
    attachX: BACK_ATTACH_X,
    attachY: BACK_ATTACH_Y,
    z: LEG_SIDE_OFFSET,
    gaitGroup: 1,
    isFront: false,
  },
  {
    id: 'backRight',
    attachX: BACK_ATTACH_X,
    attachY: BACK_ATTACH_Y,
    z: -LEG_SIDE_OFFSET,
    gaitGroup: 0,
    isFront: false,
  },
]

function legPhase(elapsed: number, speed: number, gaitGroup: GaitGroup) {
  return elapsed * speed + (gaitGroup === 0 ? 0 : Math.PI)
}

function legPose(
  attachX: number,
  attachY: number,
  z: number,
  phase: number,
  isFront: boolean,
): { top: Vector3; knee: Vector3; hoof: Vector3 } {
  const swing = Math.sin(phase)
  const lift = Math.max(0, swing) * 0.032
  const stance = isFront ? FRONT_STANCE_OFFSET : BACK_STANCE_OFFSET
  const stride = swing * STRIDE_AMP + stance
  const top = new Vector3(attachX, attachY, z)
  const kneeY = attachY - 0.15 + lift
  const knee = new Vector3(attachX + stride, kneeY, z)
  const hoof = new Vector3(attachX + stride * 1.12, LEG_HOOF_Y + lift * 0.45, z)

  return { top, knee, hoof }
}

function legSegment(from: Vector3, to: Vector3): {
  position: [number, number, number]
  rotation: number
  length: number
} {
  const mid = from.clone().add(to).multiplyScalar(0.5)
  const length = from.distanceTo(to)
  const rotation = Math.atan2(to.y - from.y, to.x - from.x) - Math.PI / 2
  return {
    position: [mid.x, mid.y, mid.z],
    rotation,
    length: Math.max(length, 0.01),
  }
}

function AnimatedWireLeg({
  config,
  active,
  opacity,
}: {
  config: LegConfig
  active: boolean
  opacity: number
}) {
  const upperRef = useRef<Mesh>(null)
  const lowerRef = useRef<Mesh>(null)
  const top = useMemo(() => new Vector3(), [])
  const knee = useMemo(() => new Vector3(), [])
  const hoof = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const speed = active ? WALK_SPEED : WALK_SPEED * 0.4
    const phase = legPhase(state.clock.elapsedTime, speed, config.gaitGroup)
    const pose = legPose(config.attachX, config.attachY, config.z, phase, config.isFront)

    top.copy(pose.top)
    knee.copy(pose.knee)
    hoof.copy(pose.hoof)

    const upper = legSegment(top, knee)
    const lower = legSegment(knee, hoof)

    if (upperRef.current) {
      upperRef.current.position.set(...upper.position)
      upperRef.current.rotation.z = upper.rotation
      upperRef.current.scale.y = upper.length
    }
    if (lowerRef.current) {
      lowerRef.current.position.set(...lower.position)
      lowerRef.current.rotation.z = lower.rotation
      lowerRef.current.scale.y = lower.length
    }
  })

  return (
    <group>
      <mesh ref={upperRef} scale={[1, 1, 1]}>
        <boxGeometry args={[0.052, 1, 0.052]} />
        <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={opacity} />
      </mesh>
      <mesh ref={lowerRef} scale={[1, 1, 1]}>
        <boxGeometry args={[0.046, 1, 0.046]} />
        <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

/** Side-profile cow facing +X. Body keypoints at center; legs offset on Z. */
const KP = {
  horn: new Vector3(0.36, 0.9, 0),
  head: new Vector3(0.44, 0.8, 0),
  muzzle: new Vector3(0.56, 0.66, 0.02),
  ear: new Vector3(0.4, 0.86, -0.04),
  neck: new Vector3(0.24, 0.74, 0),
  shoulder: new Vector3(FRONT_ATTACH_X, 0.72, 0),
  spine: new Vector3(-0.08, 0.78, 0),
  hip: new Vector3(BACK_ATTACH_X, 0.7, 0),
  tailBase: new Vector3(-0.44, 0.66, 0),
  tailTip: new Vector3(-0.5, 0.5, 0.02),
  belly: new Vector3(-0.04, BELLY_Y, 0),
} as const

const BODY_SKELETON: [keyof typeof KP, keyof typeof KP][] = [
  ['head', 'neck'],
  ['neck', 'shoulder'],
  ['shoulder', 'spine'],
  ['spine', 'hip'],
  ['hip', 'tailBase'],
  ['tailBase', 'tailTip'],
]

const BODY_KEYPOINTS = ['head', 'muzzle', 'neck', 'shoulder', 'spine', 'hip', 'tailBase'] as const

function boxEdgePoints(min: Vector3, max: Vector3): Vector3[][] {
  const corners = [
    new Vector3(min.x, min.y, min.z),
    new Vector3(max.x, min.y, min.z),
    new Vector3(max.x, max.y, min.z),
    new Vector3(min.x, max.y, min.z),
    new Vector3(min.x, min.y, max.z),
    new Vector3(max.x, min.y, max.z),
    new Vector3(max.x, max.y, max.z),
    new Vector3(min.x, max.y, max.z),
  ]

  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]

  return edges.map(([a, b]) => [corners[a].clone(), corners[b].clone()])
}

function cornerBrackets(min: Vector3, max: Vector3, arm: number): Vector3[][] {
  const frontZ = max.z + 0.01
  const corners: { x: number; y: number; sx: number; sy: number }[] = [
    { x: min.x, y: min.y, sx: 1, sy: 1 },
    { x: max.x, y: min.y, sx: -1, sy: 1 },
    { x: min.x, y: max.y, sx: 1, sy: -1 },
    { x: max.x, y: max.y, sx: -1, sy: -1 },
  ]

  return corners.map(({ x, y, sx, sy }) => [
    new Vector3(x, y, frontZ),
    new Vector3(x + sx * arm, y, frontZ),
    new Vector3(x, y, frontZ),
    new Vector3(x, y + sy * arm, frontZ),
  ])
}

function PoseDetectionScanner({ active }: { active: boolean }) {
  const scanLineRef = useRef<Mesh>(null)
  const accuracyRef = useRef<{ text: string }>(null)
  const glowRef = useRef<Mesh>(null)

  const boxEdges = useMemo(() => boxEdgePoints(SCANNER_MIN, SCANNER_MAX), [])
  const brackets = useMemo(() => cornerBrackets(SCANNER_MIN, SCANNER_MAX, 0.1), [])

  const frameOpacity = active ? 0.72 : 0.34
  const scanOpacity = active ? 0.9 : 0.4

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const scanT = (Math.sin(t * (active ? 1.4 : 0.6)) + 1) * 0.5
    const scanY = SCANNER_MIN.y + scanT * (SCANNER_MAX.y - SCANNER_MIN.y)

    if (scanLineRef.current) {
      scanLineRef.current.position.y = scanY
    }

    const accuracy =
      ACCURACY_MIN +
      (ACCURACY_MAX - ACCURACY_MIN) *
        (0.55 + 0.28 * Math.sin(t * 1.15) + 0.17 * Math.sin(t * 2.35 + 1.2))

    if (accuracyRef.current) {
      accuracyRef.current.text = `WALKING ${accuracy.toFixed(1)}%`
    }

    if (glowRef.current) {
      const material = glowRef.current.material
      if (material && 'opacity' in material) {
        const pulse = active ? 0.05 + Math.sin(t * 3.2) * 0.025 : 0.02
        material.opacity += (pulse - material.opacity) * 0.1
      }
    }
  })

  return (
    <group>
      {boxEdges.map((points, index) => (
        <Line
          key={`edge-${index}`}
          points={points}
          color={WORK_ACCENT}
          transparent
          opacity={frameOpacity * 0.45}
        />
      ))}

      {brackets.map((points, index) => (
        <Line
          key={`bracket-${index}`}
          points={points}
          color={WORK_ACCENT}
          transparent
          opacity={frameOpacity}
        />
      ))}

      <mesh
        ref={scanLineRef}
        position={[
          (SCANNER_MIN.x + SCANNER_MAX.x) * 0.5,
          SCANNER_MIN.y,
          SCANNER_MAX.z + 0.015,
        ]}
      >
        <boxGeometry args={[SCANNER_SIZE.x - 0.08, 0.004, 0.01]} />
        <meshBasicMaterial color={WORK_ACCENT} transparent opacity={scanOpacity} depthWrite={false} />
      </mesh>

      <mesh ref={glowRef} position={[SCANNER_CENTER.x, SCANNER_CENTER.y, SCANNER_CENTER.z]}>
        <boxGeometry args={[SCANNER_SIZE.x, SCANNER_SIZE.y, SCANNER_SIZE.z]} />
        <meshBasicMaterial color={WORK_ACCENT} transparent opacity={0.04} depthWrite={false} />
      </mesh>

      <Text
        ref={accuracyRef}
        position={[SCANNER_MIN.x, SCANNER_MAX.y + 0.05, SCANNER_MAX.z + 0.02]}
        fontSize={0.055}
        color={WORK_ACCENT}
        anchorX="left"
        anchorY="bottom"
        letterSpacing={0.02}
        outlineWidth={0.004}
        outlineColor="#050505"
      >
        POSE 88.5%
      </Text>

      <Text
        position={[SCANNER_MIN.x, SCANNER_MAX.y + 0.11, SCANNER_MAX.z + 0.02]}
        fontSize={0.034}
        color={WORK_MUTED}
        anchorX="left"
        anchorY="bottom"
        letterSpacing={0.04}
        outlineWidth={0.003}
        outlineColor="#050505"
        fillOpacity={active ? 0.85 : 0.45}
      >
        YOLOv8 POSE
      </Text>
    </group>
  )
}

export function LivestockPoseArt({ active }: WorkArtProps) {
  const groupRef = useRef<Group>(null)
  const cowRef = useRef<Group>(null)

  const skeleton = useMemo(
    () =>
      BODY_SKELETON.map(([from, to]) => [KP[from].clone(), KP[to].clone()] as [Vector3, Vector3]),
    [],
  )

  const bodyOutline = useMemo(
    () => [
      KP.muzzle.clone(),
      KP.head.clone(),
      KP.horn.clone(),
      KP.ear.clone(),
      KP.neck.clone(),
      KP.shoulder.clone(),
      KP.spine.clone(),
      KP.hip.clone(),
      KP.tailBase.clone(),
      new Vector3(-0.46, 0.56, 0),
      KP.belly.clone(),
      new Vector3(FRONT_ATTACH_X + 0.06, FRONT_ATTACH_Y - 0.06, 0),
      new Vector3(-0.1, BELLY_Y, 0),
      new Vector3(BACK_ATTACH_X - 0.04, BACK_ATTACH_Y - 0.06, 0),
      KP.muzzle.clone(),
    ],
    [],
  )

  const bellyLine = useMemo(
    () => [KP.shoulder.clone(), KP.belly.clone(), KP.hip.clone()],
    [],
  )

  const muzzleLine = useMemo(
    () => [KP.head.clone(), KP.muzzle.clone(), new Vector3(0.56, 0.62, 0.02)],
    [],
  )

  const hornLine = useMemo(
    () => [KP.head.clone(), KP.horn.clone(), new Vector3(0.38, 0.94, 0)],
    [],
  )

  const earLine = useMemo(
    () => [KP.head.clone(), KP.ear.clone(), new Vector3(0.42, 0.9, -0.05)],
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const walkSpeed = active ? WALK_SPEED : WALK_SPEED * 0.4
    const walkPhase = t * walkSpeed

    if (groupRef.current) {
      const bob = active ? Math.sin(walkPhase * 2) * 0.008 : 0
      const sway = Math.sin(walkPhase) * 0.004
      groupRef.current.position.y = WORK_ART_LIFT + bob
      groupRef.current.position.x = sway
    }
    if (cowRef.current) {
      cowRef.current.rotation.y = t * (active ? 0.45 : 0.18)
    }
  })

  const wireOpacity = workWireOpacity(active, 0.32, 0.7)
  const bodyWireOpacity = wireOpacity * 0.45
  const boneOpacity = active ? 0.55 : 0.28
  const outlineOpacity = active ? 0.52 : 0.26
  const accentOpacity = active ? 0.92 : 0.45

  return (
    <group ref={groupRef}>
      <group
        ref={cowRef}
        position={[0, WORK_ART_VISUAL_CENTER_Y - COW_LOCAL_CENTER_Y, 0]}
      >
        <Line points={bodyOutline} color={WORK_MUTED} transparent opacity={outlineOpacity} />
        <Line points={bellyLine} color={WORK_MUTED} transparent opacity={outlineOpacity * 0.85} />
        <Line points={muzzleLine} color={WORK_MUTED} transparent opacity={outlineOpacity} />
        <Line points={hornLine} color={WORK_MUTED} transparent opacity={outlineOpacity * 0.9} />
        <Line points={earLine} color={WORK_MUTED} transparent opacity={outlineOpacity * 0.8} />

        {skeleton.map((points, index) => (
          <Line
            key={index}
            points={points}
            color={WORK_ACCENT}
            transparent
            opacity={boneOpacity}
          />
        ))}

        <mesh position={[0.04, 0.67, 0]}>
          <boxGeometry args={[0.56, 0.2, BODY_DEPTH]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyWireOpacity} />
        </mesh>

        <mesh position={[FRONT_ATTACH_X, FRONT_ATTACH_Y - 0.02, 0]}>
          <boxGeometry args={[0.12, 0.1, BODY_DEPTH * 0.85]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyWireOpacity * 0.95} />
        </mesh>

        <mesh position={[BACK_ATTACH_X, BACK_ATTACH_Y, 0]}>
          <boxGeometry args={[0.14, 0.12, BODY_DEPTH * 0.85]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyWireOpacity * 0.95} />
        </mesh>

        <mesh position={[0.38, 0.74, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.16, 0.18, 0.15]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyWireOpacity * 1.2} />
        </mesh>

        <mesh position={[0.52, 0.64, 0.02]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.14, 0.1, 0.12]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyWireOpacity * 1.1} />
        </mesh>

        <mesh position={[-0.36, 0.66, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.15]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={bodyWireOpacity * 0.9} />
        </mesh>

        {LEG_CONFIGS.map((config) => (
          <AnimatedWireLeg
            key={config.id}
            config={config}
            active={active}
            opacity={bodyWireOpacity}
          />
        ))}

        {BODY_KEYPOINTS.map((id) => (
          <mesh key={id} position={KP[id]}>
            <sphereGeometry args={[id === 'head' || id === 'hip' ? 0.034 : 0.024, 8, 8]} />
            <meshBasicMaterial color={WORK_ACCENT} transparent opacity={accentOpacity} />
          </mesh>
        ))}

        <PoseDetectionScanner active={active} />
      </group>
    </group>
  )
}

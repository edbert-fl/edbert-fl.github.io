import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import type { Group } from 'three'
import {
  EXPERIENCE_ROLES,
  getNodeFocus,
  getPipelineFloatIndex,
  PIPELINE_BRANCH_INDICES,
  PIPELINE_NODE_CAMERA,
  PIPELINE_NODE_POSITIONS,
  type ExperienceNodeVariant,
} from '../../../data/experience'
import { ExperienceNodeArt } from './nodes/ExperienceNodeArt'
import { PIPELINE_ACCENT, PIPELINE_DIM, PIPELINE_MUTED } from './nodes/pipelineTheme'

const NODE_Y_OFFSET = 0.2
const _vecA = new Vector3()
const _vecB = new Vector3()

function toPathPoint(position: [number, number, number]) {
  return new Vector3(...position).add(new Vector3(0, NODE_Y_OFFSET, 0))
}

function sampleNodePosition(floatIndex: number, target: Vector3) {
  const maxIdx = PIPELINE_NODE_POSITIONS.length - 1
  const clamped = Math.min(maxIdx, Math.max(0, floatIndex))
  const idx = Math.floor(clamped)
  const frac = clamped - idx
  const nextIdx = Math.min(idx + 1, maxIdx)

  _vecA.copy(toPathPoint(PIPELINE_NODE_POSITIONS[idx]))
  _vecB.copy(toPathPoint(PIPELINE_NODE_POSITIONS[nextIdx]))
  target.lerpVectors(_vecA, _vecB, frac)
}

function sampleCameraRig(floatIndex: number) {
  const maxIdx = PIPELINE_NODE_CAMERA.length - 1
  const clamped = Math.min(maxIdx, Math.max(0, floatIndex))
  const idx = Math.floor(clamped)
  const frac = clamped - idx
  const nextIdx = Math.min(idx + 1, maxIdx)
  const a = PIPELINE_NODE_CAMERA[idx]
  const b = PIPELINE_NODE_CAMERA[nextIdx]

  return {
    distance: a.distance + (b.distance - a.distance) * frac,
    height: a.height + (b.height - a.height) * frac,
  }
}

function FaceCamera({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null)
  const { camera } = useThree()

  useFrame(() => {
    if (!ref.current) return
    ref.current.quaternion.copy(camera.quaternion)
  })

  return <group ref={ref}>{children}</group>
}

function PipelineNode({
  position,
  scale,
  variant,
  focus,
  index,
}: {
  position: [number, number, number]
  scale: number
  variant: ExperienceNodeVariant
  focus: number
  index: number
}) {
  const groupRef = useRef<Group>(null)
  const targetScale = scale * (0.88 + focus * 0.27)
  const active = focus > 0.35
  const color = active ? PIPELINE_ACCENT : index % 2 === 0 ? PIPELINE_MUTED : PIPELINE_DIM
  const dimColor = PIPELINE_DIM

  useFrame(() => {
    if (!groupRef.current) return
    const current = groupRef.current.scale.x
    const next = current + (targetScale - current) * 0.07
    groupRef.current.scale.setScalar(next)
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <FaceCamera>
        <ExperienceNodeArt variant={variant} active={active} color={color} dimColor={dimColor} />
      </FaceCamera>
    </group>
  )
}

function PipelineConnector({
  from,
  to,
  emphasis,
}: {
  from: [number, number, number]
  to: [number, number, number]
  emphasis: number
}) {
  const points = useMemo(
    () => [toPathPoint(from), toPathPoint(to)],
    [from, to],
  )

  return (
    <group>
      <Line
        points={points}
        color={PIPELINE_ACCENT}
        transparent
        opacity={0.18 + emphasis * 0.42}
      />
    </group>
  )
}

interface ExperiencePipelineSceneProps {
  pathProgress: number
}

export function ExperiencePipelineScene({ pathProgress }: ExperiencePipelineSceneProps) {
  const groupRef = useRef<Group>(null)
  const { camera } = useThree()
  const lookTarget = useRef(new Vector3())
  const cameraTarget = useRef(new Vector3())
  const focusPoint = useRef(new Vector3())
  const smoothFloatIndex = useRef(0)

  const pathPoints = useMemo(
    () => PIPELINE_NODE_POSITIONS.map((position) => toPathPoint(position)),
    [],
  )

  const pathCurve = useMemo(() => new CatmullRomCurve3(pathPoints), [pathPoints])
  const pathLinePoints = useMemo(() => pathCurve.getPoints(96), [pathCurve])

  const tubeGeometry = useMemo(
    () => new TubeGeometry(pathCurve, 128, 0.045, 10, false),
    [pathCurve],
  )

  useEffect(() => () => tubeGeometry.dispose(), [tubeGeometry])

  const branchLine = useMemo(() => {
    const [a, b] = PIPELINE_BRANCH_INDICES
    return [toPathPoint(PIPELINE_NODE_POSITIONS[a]), toPathPoint(PIPELINE_NODE_POSITIONS[b])]
  }, [])

  const segmentLinks = useMemo(
    () =>
      PIPELINE_NODE_POSITIONS.slice(0, -1).map((from, index) => ({
        from,
        to: PIPELINE_NODE_POSITIONS[index + 1],
        index,
      })),
    [],
  )

  const floatIndex = getPipelineFloatIndex(pathProgress)

  useFrame((_state, delta) => {
    const blend = 1 - Math.exp(-delta * 3.5)
    const targetFloat = getPipelineFloatIndex(pathProgress)
    smoothFloatIndex.current += (targetFloat - smoothFloatIndex.current) * blend

    const fi = smoothFloatIndex.current
    sampleNodePosition(fi, focusPoint.current)
    const rig = sampleCameraRig(fi)

    cameraTarget.current.set(
      focusPoint.current.x,
      focusPoint.current.y + rig.height,
      focusPoint.current.z + rig.distance,
    )

    camera.position.lerp(cameraTarget.current, 0.1)
    lookTarget.current.copy(focusPoint.current)
    camera.lookAt(lookTarget.current)
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, 4]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-3, -1, 2]} intensity={0.45} color={PIPELINE_ACCENT} />

      <group ref={groupRef}>
        <mesh geometry={tubeGeometry}>
          <meshBasicMaterial color={PIPELINE_ACCENT} wireframe transparent opacity={0.14} />
        </mesh>

        <Line points={pathLinePoints} color={PIPELINE_ACCENT} transparent opacity={0.45} />

        {segmentLinks.map(({ from, to, index }) => {
          const segmentCenter = (index + 0.5) / (PIPELINE_NODE_POSITIONS.length - 1)
          const emphasis = Math.max(0, 1 - Math.abs(segmentCenter - pathProgress) * 3)
          return (
            <PipelineConnector key={index} from={from} to={to} emphasis={emphasis} />
          )
        })}

        <Line points={branchLine} color={PIPELINE_ACCENT} transparent opacity={0.4} />

        {EXPERIENCE_ROLES.map((role, index) => (
          <PipelineNode
            key={role.id}
            position={PIPELINE_NODE_POSITIONS[index]}
            scale={role.nodeScale}
            variant={role.nodeVariant}
            focus={getNodeFocus(index, floatIndex)}
            index={index}
          />
        ))}

        <mesh position={[0, -0.2, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[22, 16, 28, 20]} />
          <meshBasicMaterial color={PIPELINE_MUTED} wireframe transparent opacity={0.05} />
        </mesh>
      </group>
    </>
  )
}

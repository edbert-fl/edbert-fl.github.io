import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { Vector3 } from 'three'
import {
  getWorkFloatIndex,
  getWorkFocus,
  WORK_PODIUM_SPACING,
  WORK_PROJECTS,
} from '../../../data/work'
import { FridgeArt } from './art/FridgeArt'
import { LivestockPoseArt } from './art/LivestockPoseArt'
import { MarketingChatbotArt } from './art/MarketingChatbotArt'
import { ResearchAgentArt } from './art/ResearchAgentArt'
import { CoinArt } from './art/CoinArt'

const ACCENT = '#22d3ee'
const MUTED = '#f4f4f5'
const DIM = '#a1a1aa'

const _target = new Vector3()
const _cameraTarget = new Vector3()

interface WorkPodiumSceneProps {
  scrollProgress: number
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

function Podium({ active, hasArtwork }: { active: boolean; hasArtwork: boolean }) {
  const opacity = active ? 0.62 : 0.28
  const accentOpacity = active ? 0.45 : 0.18

  return (
    <group position={[0, -0.05, 0]}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.05, 0.16, 1.05]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.05, 0.16, 1.05]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.04} />
      </mesh>

      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.34, 0.42, 0.36, 8]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={opacity * 0.9} />
      </mesh>

      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[1.25, 0.12, 1.25]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={opacity * 0.75} />
      </mesh>

      {!hasArtwork && (
        <mesh position={[0, 0.42, 0]}>
          <ringGeometry args={[0.18, 0.24, 24]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={accentOpacity} />
        </mesh>
      )}
    </group>
  )
}

function WorkPodium({
  index,
  focus,
}: {
  index: number
  focus: number
}) {
  const groupRef = useRef<Group>(null)
  const project = WORK_PROJECTS[index]
  const active = focus > 0.35
  const x = index * WORK_PODIUM_SPACING - ((WORK_PROJECTS.length - 1) * WORK_PODIUM_SPACING) / 2

  useFrame(() => {
    if (!groupRef.current) return
    const targetScale = 0.82 + focus * 0.28
    groupRef.current.scale.lerp(_target.set(targetScale, targetScale, targetScale), 0.08)
  })

  return (
    <group ref={groupRef} position={[x, -0.35, 0]}>
      <Podium active={active} hasArtwork={Boolean(project.artwork)} />
      {project.artwork === 'coin' && <CoinArt active={active} />}
      {project.artwork === 'fridge' && (
        <FaceCamera>
          <FridgeArt active={active} />
        </FaceCamera>
      )}
      {project.artwork === 'research-graph' && (
        <FaceCamera>
          <ResearchAgentArt active={active} />
        </FaceCamera>
      )}
      {project.artwork === 'livestock-pose' && <LivestockPoseArt active={active} />}
      {project.artwork === 'marketing-chatbot' && (
        <FaceCamera>
          <MarketingChatbotArt active={active} />
        </FaceCamera>
      )}
    </group>
  )
}

export function WorkPodiumScene({ scrollProgress }: WorkPodiumSceneProps) {
  const floatIndex = getWorkFloatIndex(scrollProgress)
  const { camera } = useThree()

  useFrame(() => {
    const centerX =
      floatIndex * WORK_PODIUM_SPACING - ((WORK_PROJECTS.length - 1) * WORK_PODIUM_SPACING) / 2
    _cameraTarget.set(centerX + 0.2, 0.55, 5.4)
    camera.position.lerp(_cameraTarget, 0.06)
    camera.lookAt(centerX, 0.35, 0)
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 5, 6]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-3, 2, 4]} intensity={0.55} color={ACCENT} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
        <planeGeometry args={[24, 8]} />
        <meshBasicMaterial color={DIM} wireframe transparent opacity={0.06} />
      </mesh>

      {WORK_PROJECTS.map((project, index) => (
        <WorkPodium key={project.id} index={index} focus={getWorkFocus(index, floatIndex)} />
      ))}
    </>
  )
}

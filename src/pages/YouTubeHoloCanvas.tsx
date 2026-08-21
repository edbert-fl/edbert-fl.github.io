import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { MathUtils } from 'three'
import { VideoPlayerArt } from '../components/Work/scenes/art/VideoPlayerArt'
import {
  WORK_ACCENT,
  WORK_ART_LIFT,
  WORK_ART_VISUAL_CENTER_Y,
} from '../components/Work/scenes/art/workArtTheme'
import './YouTubeHoloCanvas.css'

/** Matches VideoPlayerArt geometry so the scan sits on the monitor. */
const SCREEN_W = 0.92
const SCREEN_H = 0.56
const BEZEL = 0.04
const STAND_H = 0.14
const SCREEN_LOCAL_Y = WORK_ART_VISUAL_CENTER_Y - 0.005

const STAND_FOOT_Y =
  SCREEN_LOCAL_Y - SCREEN_H * 0.5 - BEZEL - STAND_H * 0.75 - 0.03

/** Full art bounds in lifted local space (includes WORK_ART_LIFT). */
const ART_TOP = WORK_ART_LIFT + SCREEN_LOCAL_Y + SCREEN_H * 0.5 + BEZEL
const ART_BOTTOM = WORK_ART_LIFT + STAND_FOOT_Y
const ART_CENTER_Y = (ART_TOP + ART_BOTTOM) * 0.5

const HOLO_SCALE = 4.8
const HOLO_X = 1.85
const HOLO_Y = -ART_CENTER_Y * HOLO_SCALE

const ENTRY_DURATION = 1.15

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function HoloCamera() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0.75, 0.02, 10.6)
    camera.lookAt(HOLO_X * 0.72, 0.02, 0)
  }, [camera])

  return null
}

function HoloScene() {
  const rootRef = useRef<Group>(null)
  const effectsRef = useRef<Group>(null)
  const scanRef = useRef<Mesh>(null)
  const entryStartRef = useRef<number | null>(null)
  const entryDoneRef = useRef(false)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (entryStartRef.current === null) {
      entryStartRef.current = t
    }

    const raw = Math.min(1, (t - entryStartRef.current) / ENTRY_DURATION)
    const entry = easeOutCubic(raw)
    if (raw >= 1) entryDoneRef.current = true

    const bob = entryDoneRef.current ? Math.sin(t * 1.5) * 0.02 : 0

    if (rootRef.current) {
      const scale = HOLO_SCALE * MathUtils.lerp(0.28, 1, entry)
      rootRef.current.scale.setScalar(scale)
      rootRef.current.position.x = MathUtils.lerp(HOLO_X + 1.4, HOLO_X, entry)
      rootRef.current.position.y = MathUtils.lerp(HOLO_Y - 0.85, HOLO_Y, entry)
      rootRef.current.position.z = MathUtils.lerp(-1.2, 0, entry)

      const idleYaw = Math.sin(t * 0.28) * 0.08 * entry
      const idlePitch = Math.sin(t * 0.2) * 0.018 * entry
      rootRef.current.rotation.y = MathUtils.lerp(0.55, 0, entry) + idleYaw
      rootRef.current.rotation.x = MathUtils.lerp(0.18, 0, entry) + idlePitch
    }

    // Track VideoPlayerArt's WORK_ART_LIFT + bob so the scan stays glued to the mesh.
    if (effectsRef.current) {
      effectsRef.current.position.y = WORK_ART_LIFT + bob
    }

    if (scanRef.current) {
      const scanReveal = MathUtils.clamp((raw - 0.45) / 0.4, 0, 1)
      const inset = 0.04
      const span = SCREEN_H - inset * 2
      const travel = ((t * 0.28) % 1) * span
      scanRef.current.position.y = SCREEN_LOCAL_Y - SCREEN_H * 0.5 + inset + travel
      const material = scanRef.current.material
      if (material && 'opacity' in material) {
        material.opacity = scanReveal * (0.14 + Math.sin(t * 4) * 0.05)
      }
      scanRef.current.visible = scanReveal > 0.02
    }
  })

  return (
    <>
      <HoloCamera />
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 2.5, 4]} intensity={0.9} color="#ffffff" />
      <pointLight position={[-2, 1.5, 3]} intensity={0.65} color={WORK_ACCENT} />

      <group ref={rootRef} position={[HOLO_X, HOLO_Y, 0]} scale={HOLO_SCALE * 0.28}>
        <VideoPlayerArt active />

        <group ref={effectsRef}>
          <mesh ref={scanRef} position={[0, SCREEN_LOCAL_Y, 0.08]} visible={false}>
            <planeGeometry args={[SCREEN_W * 0.96, 0.022]} />
            <meshBasicMaterial color={WORK_ACCENT} transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </>
  )
}

export function YouTubeHoloCanvas() {
  return (
    <div className="ytc-holo" aria-hidden="true">
      <Canvas
        className="ytc-holo__canvas"
        tabIndex={-1}
        camera={{ position: [0.75, 0.02, 10.6], fov: 30 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <HoloScene />
        </Suspense>
      </Canvas>
      <div className="ytc-holo__veil" />
    </div>
  )
}

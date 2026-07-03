import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { DoubleSide, Quaternion, Vector3 } from 'three'
import type { Line2 } from 'three-stdlib'
import { createCowMotion, HeroCow, type CowMotionState } from './HeroCow'
import { HeroExplosion, type ExplosionState } from './HeroExplosion'

const ACCENT = '#22d3ee'
const MUTED = '#a1a1aa'
const LASER = '#f87171'

const UFO_SCALE = 0.34
const COW_COUNT = 3
const MAX_LIFT = 0.55
const LASER_SHOTS = 2
const SHOT_DURATION = 1.35
const HIT_WAIT = 6
const EXPLOSION_DURATION = 0.9

const LASER_CYCLE = 22
const TRACTOR_CYCLE = 16

const RIM_LIGHTS = Array.from({ length: 4 }, (_, index) => {
  const angle = (index / 4) * Math.PI * 2 + Math.PI / 4
  return [Math.cos(angle) * 0.46, -0.018, Math.sin(angle) * 0.46] as [number, number, number]
})

const MISS_OFFSETS: [number, number][] = [
  [0.28, 0.14],
  [-0.24, 0.1],
  [0, 0],
]

type AttackMode = 'laser' | 'tractor'

interface CycleState {
  mode: AttackMode
  duration: number
  index: number
  phaseT: number
}

function getCycleState(t: number): CycleState {
  const pattern: { mode: AttackMode; duration: number }[] = [
    { mode: 'laser', duration: LASER_CYCLE },
    { mode: 'tractor', duration: TRACTOR_CYCLE },
  ]

  let elapsed = 0
  let index = 0

  while (true) {
    const entry = pattern[index % pattern.length]
    if (t < elapsed + entry.duration) {
      return {
        mode: entry.mode,
        duration: entry.duration,
        index,
        phaseT: t - elapsed,
      }
    }
    elapsed += entry.duration
    index += 1
  }
}

function MiniUfo() {
  const glowRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!glowRef.current) return
    const material = glowRef.current.material
    if (!material || !('opacity' in material)) return
    const target = 0.55 + Math.sin(state.clock.elapsedTime * 3.2) * 0.2
    material.opacity += (target - material.opacity) * 0.1
  })

  return (
    <group scale={UFO_SCALE}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.52, 0.05, 20, 1, true]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.38} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.012, 0]}>
        <torusGeometry args={[0.47, 0.006, 6, 36]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.45} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.55} />
      </mesh>
      {RIM_LIGHTS.map((position) => (
        <mesh key={position.join('-')} position={position}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function resetCowMotion(motion: CowMotionState) {
  motion.hidden = false
  motion.offsetY = 0
  motion.explodeT = -1
}

function patrolPosition(t: number, viewport: { width: number; height: number }) {
  const patrolT = t * 0.45
  return {
    x: viewport.width * 0.08 + Math.sin(patrolT) * viewport.width * 0.32,
    y: Math.sin(patrolT * 0.62) * viewport.height * 0.18 + viewport.height * 0.08,
  }
}

const UFO_PATROL_SPEED = 3
const UFO_CHASE_SPEED = 3

function moveToward(
  current: { x: number; y: number },
  target: { x: number; y: number },
  delta: number,
  speed: number,
) {
  const alpha = Math.min(1, delta * speed)
  current.x += (target.x - current.x) * alpha
  current.y += (target.y - current.y) * alpha
}

export function HeroUfoScene() {
  const ufoRef = useRef<Group>(null)
  const tractorRef = useRef<Mesh>(null)
  const tractorBeamRef = useRef<Mesh>(null)
  const laserLineRef = useRef<Line2>(null)
  const { viewport } = useThree()

  const cowSpots = useMemo(
    () => [
      { x: viewport.width * 0.12, y: -viewport.height * 0.28, z: 0.05, rot: 0.35 },
      { x: viewport.width * 0.28, y: -viewport.height * 0.32, z: -0.08, rot: -0.25 },
      { x: viewport.width * 0.2, y: -viewport.height * 0.22, z: 0.12, rot: 0.1 },
    ],
    [viewport.width, viewport.height],
  )

  const cowMotion = useRef<CowMotionState[]>(
    Array.from({ length: COW_COUNT }, () => createCowMotion()),
  )
  const hitTriggered = useRef(false)
  const dropKickRef = useRef(false)
  const dropVelocity = useRef(0)
  const lastCycleIndex = useRef(-1)
  const ufoPos = useRef({ x: 0, y: 0 })
  const ufoTarget = useRef({ x: 0, y: 0 })
  const ufoReady = useRef(false)
  const prevPhaseKey = useRef('')

  const ufoWorld = useRef(new Vector3())
  const cowWorld = useRef(new Vector3())
  const laserEnd = useRef(new Vector3())
  const laserOpacity = useRef(0)
  const tractorOpacity = useRef(0)
  const laserPoints = useRef([new Vector3(), new Vector3()])
  const beamDir = useRef(new Vector3())
  const beamQuat = useRef(new Quaternion())
  const flipQuat = useRef(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI))
  const explosionState = useRef<ExplosionState>({ progress: -1, position: [0, 0, 0] })

  useFrame((state, delta) => {
    if (!ufoRef.current) return

    const t = state.clock.elapsedTime
    const cycle = getCycleState(t)
    const targetCow = cycle.index % COW_COUNT
    const spot = cowSpots[targetCow]
    const phaseT = cycle.phaseT

    if (cycle.index !== lastCycleIndex.current) {
      lastCycleIndex.current = cycle.index
      hitTriggered.current = false
      dropKickRef.current = false
      dropVelocity.current = 0
      explosionState.current = { progress: -1, position: [0, 0, 0] }
      cowMotion.current.forEach(resetCowMotion)
      if (ufoReady.current) {
        ufoTarget.current.x = ufoPos.current.x
        ufoTarget.current.y = ufoPos.current.y
      }
      prevPhaseKey.current = ''
    }

    let targetX: number
    let targetY: number
    let phaseKey = ''
    let chaseSpeed = UFO_PATROL_SPEED
    const ufoZ = Math.sin(t * 1.2) * 0.05
    const hoverY = spot.y + viewport.height * 0.28
    const patrol = patrolPosition(t, viewport)
    const cowHover = { x: spot.x, y: hoverY }

    laserOpacity.current = 0
    tractorOpacity.current = 0

    if (cycle.mode === 'laser') {
      const patrolEnd = 5.5
      const attackEnd = patrolEnd + LASER_SHOTS * SHOT_DURATION
      const waitEnd = attackEnd + HIT_WAIT
      const skyfallEnd = waitEnd + 2.5

      if (phaseT < patrolEnd) {
        phaseKey = 'laser-patrol'
        targetX = patrol.x
        targetY = patrol.y
        cowMotion.current.forEach(resetCowMotion)
      } else if (phaseT < attackEnd) {
        phaseKey = 'laser-attack'
        targetX = cowHover.x
        targetY = cowHover.y
        chaseSpeed = UFO_CHASE_SPEED

        const attackT = phaseT - patrolEnd
        const shotIndex = Math.min(LASER_SHOTS - 1, Math.floor(attackT / SHOT_DURATION))
        const shotT = attackT - shotIndex * SHOT_DURATION

        const zap = Math.sin(shotT * 12)
        laserOpacity.current = zap > 0.15 ? 0.5 + zap * 0.5 : 0

        const [missX, missY] = MISS_OFFSETS[shotIndex]
        const isHitShot = shotIndex === LASER_SHOTS - 1

        cowMotion.current.forEach((motion, index) => {
          if (index !== targetCow) {
            resetCowMotion(motion)
            return
          }
          motion.hidden = false
          motion.offsetY = 0

          if (
            isHitShot &&
            !hitTriggered.current &&
            laserOpacity.current > 0.88 &&
            shotT > SHOT_DURATION * 0.45
          ) {
            hitTriggered.current = true
            motion.hidden = true
            motion.explodeT = 0
            explosionState.current = {
              progress: 0,
              position: [spot.x, spot.y + 0.08, spot.z],
            }
          }
        })

        if (!isHitShot || !hitTriggered.current) {
          laserEnd.current.set(spot.x + missX, spot.y + 0.08 + missY, spot.z)
        } else {
          laserEnd.current.set(spot.x, spot.y + 0.08, spot.z)
        }
      } else if (phaseT < waitEnd) {
        phaseKey = 'laser-wait'
        targetX = cowHover.x
        targetY = cowHover.y
        chaseSpeed = UFO_CHASE_SPEED

        cowMotion.current.forEach((motion, index) => {
          if (index !== targetCow) {
            resetCowMotion(motion)
            return
          }
          motion.hidden = true
          motion.offsetY = 0
        })
      } else if (phaseT < skyfallEnd) {
        phaseKey = 'laser-skyfall'
        targetX = cowHover.x
        targetY = cowHover.y
        chaseSpeed = UFO_CHASE_SPEED

        const fallT = (phaseT - waitEnd) / (skyfallEnd - waitEnd)
        const skyHeight = viewport.height * 0.62

        cowMotion.current.forEach((motion, index) => {
          if (index !== targetCow) {
            resetCowMotion(motion)
            return
          }
          motion.hidden = false
          motion.offsetY = skyHeight * (1 - easeInOut(fallT))
          motion.explodeT = -1
        })
      } else {
        phaseKey = 'laser-tail'
        targetX = patrol.x
        targetY = patrol.y
        cowMotion.current.forEach(resetCowMotion)
      }
    } else {
      const patrolEnd = 5
      const tractorEnd = 11
      const dropEnd = 15

      if (phaseT < patrolEnd) {
        phaseKey = 'tractor-patrol'
        targetX = patrol.x
        targetY = patrol.y
        cowMotion.current.forEach(resetCowMotion)
      } else if (phaseT < tractorEnd) {
        phaseKey = 'tractor-beam'
        targetX = cowHover.x
        targetY = cowHover.y
        chaseSpeed = UFO_CHASE_SPEED

        const tractorT = (phaseT - patrolEnd - 1.4) / (tractorEnd - patrolEnd - 1.4)
        tractorOpacity.current =
          phaseT > patrolEnd + 1.4 ? 0.12 + Math.sin(t * 5) * 0.06 : 0

        cowMotion.current.forEach((motion, index) => {
          if (index !== targetCow) {
            resetCowMotion(motion)
            return
          }
          motion.hidden = false
          motion.offsetY =
            phaseT > patrolEnd + 1.4
              ? easeInOut(Math.min(1, Math.max(0, tractorT) * 1.1)) * MAX_LIFT
              : 0
        })
        dropKickRef.current = false
        dropVelocity.current = 0
      } else if (phaseT < dropEnd) {
        phaseKey = 'tractor-drop'
        targetX = cowHover.x
        targetY = cowHover.y
        chaseSpeed = UFO_CHASE_SPEED

        const targetMotion = cowMotion.current[targetCow]
        if (targetMotion) {
          targetMotion.hidden = false
          if (!dropKickRef.current && targetMotion.offsetY > 0.01) {
            dropVelocity.current = -0.35
            dropKickRef.current = true
          }
          dropVelocity.current -= delta * 3.2
          targetMotion.offsetY += dropVelocity.current * delta
          if (targetMotion.offsetY <= 0) {
            targetMotion.offsetY = 0
            dropVelocity.current = 0
          }
        }

        cowMotion.current.forEach((motion, index) => {
          if (index !== targetCow) resetCowMotion(motion)
        })
      } else {
        phaseKey = 'tractor-tail'
        targetX = patrol.x
        targetY = patrol.y
        cowMotion.current.forEach(resetCowMotion)
      }
    }

    if (phaseKey && phaseKey !== prevPhaseKey.current) {
      if (ufoReady.current) {
        ufoTarget.current.x = ufoPos.current.x
        ufoTarget.current.y = ufoPos.current.y
      }
      prevPhaseKey.current = phaseKey
    }

    if (!ufoReady.current) {
      ufoPos.current.x = targetX
      ufoPos.current.y = targetY
      ufoTarget.current.x = targetX
      ufoTarget.current.y = targetY
      ufoReady.current = true
    } else {
      moveToward(ufoTarget.current, { x: targetX, y: targetY }, delta, chaseSpeed)
      moveToward(ufoPos.current, ufoTarget.current, delta, chaseSpeed)
    }

    const ufoX = ufoPos.current.x
    const ufoY = ufoPos.current.y

    if (explosionState.current.progress >= 0 && explosionState.current.progress < 1) {
      explosionState.current.progress = Math.min(
        1,
        explosionState.current.progress + delta / EXPLOSION_DURATION,
      )
    }

    const targetMotion = cowMotion.current[targetCow]
    if (targetMotion && targetMotion.explodeT >= 0 && targetMotion.explodeT < 1) {
      targetMotion.explodeT = Math.min(1, targetMotion.explodeT + delta / EXPLOSION_DURATION)
    }

    ufoRef.current.position.set(ufoX, ufoY, ufoZ)
    ufoRef.current.rotation.z = Math.sin(t * 0.55) * 0.08
    ufoRef.current.rotation.x = Math.sin(t * 0.4) * 0.05

    ufoRef.current.getWorldPosition(ufoWorld.current)
    const targetOffsetY = targetMotion?.offsetY ?? 0
    cowWorld.current.set(spot.x, spot.y + targetOffsetY + 0.08, spot.z)

    laserPoints.current[0].copy(ufoWorld.current)
    if (cycle.mode === 'laser' && laserOpacity.current > 0.02) {
      laserPoints.current[1].copy(laserEnd.current)
    } else {
      laserPoints.current[1].copy(cowWorld.current)
    }

    if (laserLineRef.current) {
      const [start, end] = laserPoints.current
      laserLineRef.current.geometry.setPositions([
        start.x,
        start.y,
        start.z,
        end.x,
        end.y,
        end.z,
      ])
      laserLineRef.current.material.opacity = laserOpacity.current
      laserLineRef.current.visible = laserOpacity.current > 0.02
    }

    if (tractorRef.current) {
      const material = tractorRef.current.material
      if (material && 'opacity' in material) {
        material.opacity += (tractorOpacity.current - material.opacity) * 0.12
      }
      tractorRef.current.visible = tractorOpacity.current > 0.02
    }

    if (tractorBeamRef.current) {
      beamDir.current.copy(cowWorld.current).sub(ufoWorld.current)
      const distance = beamDir.current.length()
      if (distance > 0.001 && tractorOpacity.current > 0.02) {
        beamDir.current.normalize()
        tractorBeamRef.current.position.lerpVectors(ufoWorld.current, cowWorld.current, 0.5)
        beamQuat.current.setFromUnitVectors(new Vector3(0, 1, 0), beamDir.current)
        beamQuat.current.multiply(flipQuat.current)
        tractorBeamRef.current.quaternion.copy(beamQuat.current)
        tractorBeamRef.current.scale.set(
          0.14 + tractorOpacity.current * 0.1,
          distance,
          0.14 + tractorOpacity.current * 0.1,
        )
      }
      const material = tractorBeamRef.current.material
      if (material && 'opacity' in material) {
        material.opacity += (tractorOpacity.current - material.opacity) * 0.12
      }
      tractorBeamRef.current.visible = tractorOpacity.current > 0.02
    }
  })

  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 2, 3]} intensity={0.35} color={ACCENT} />

      {cowSpots.map((spot, index) => (
        <HeroCow
          key={`${spot.x}-${spot.y}`}
          index={index}
          basePosition={[spot.x, spot.y, spot.z]}
          rotation={spot.rot}
          motionRef={cowMotion}
        />
      ))}

      <HeroExplosion stateRef={explosionState} />

      <group ref={ufoRef}>
        <MiniUfo />
        <mesh ref={tractorRef} position={[0, -0.05, 0]} visible={false}>
          <ringGeometry args={[0.06, 0.09, 24]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0} side={DoubleSide} />
        </mesh>
      </group>

      <mesh ref={tractorBeamRef} visible={false}>
        <coneGeometry args={[1, 1, 16, 1, true]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0} side={DoubleSide} />
      </mesh>

      <Line
        ref={laserLineRef}
        points={[
          [0, 0, 0],
          [0, 0, 0],
        ]}
        color={LASER}
        lineWidth={1.5}
        transparent
        opacity={0}
      />
    </group>
  )
}

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Line } from '@react-three/drei'
import type { Group } from 'three'
import { Vector3 } from 'three'

const ACCENT = '#22d3ee'
const MUTED = '#f4f4f5'

const HEAD_Y = 0.42
const HEAD_HEIGHT = 0.36
const SPIN_SENSITIVITY = 0.012

interface AboutRobotSceneProps {
  awake: boolean
}

export function AboutRobotScene({ awake }: AboutRobotSceneProps) {
  const groupRef = useRef<Group>(null)
  const spinY = useRef(0)
  const dragRef = useRef({ active: false, lastX: 0, pointerId: -1 })
  const { gl, camera, size } = useThree()
  const mobile = size.width <= 720
  const robotX = mobile ? 0 : 1.05

  useEffect(() => {
    // Desktop: camera offset with robot on the right. Mobile: both centered.
    camera.position.set(mobile ? 0 : 1.05, mobile ? 0.08 : 0.05, mobile ? 2.85 : 2.5)
    camera.lookAt(mobile ? 0 : 0, mobile ? 0.05 : 0, 0)
  }, [camera, mobile])

  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      // On desktop, leave the text column free; on mobile the robot sits behind the copy.
      if (!mobile && x < 0.38) return

      dragRef.current = { active: true, lastX: event.clientX, pointerId: event.pointerId }
      canvas.setPointerCapture(event.pointerId)
      canvas.style.cursor = 'grabbing'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active || event.pointerId !== dragRef.current.pointerId) return

      const deltaX = event.clientX - dragRef.current.lastX
      dragRef.current.lastX = event.clientX
      spinY.current += deltaX * SPIN_SENSITIVITY
    }

    const endDrag = (event: PointerEvent) => {
      if (!dragRef.current.active || event.pointerId !== dragRef.current.pointerId) return

      dragRef.current.active = false
      dragRef.current.pointerId = -1
      canvas.releasePointerCapture(event.pointerId)
      canvas.style.cursor = 'grab'
    }

    canvas.style.cursor = awake ? 'grab' : 'default'
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)

    return () => {
      canvas.style.cursor = ''
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
    }
  }, [awake, gl, mobile])

  useFrame((state) => {
    camera.position.set(mobile ? 0 : 1.05, mobile ? 0.08 : 0.05, mobile ? 2.85 : 2.5)
    camera.lookAt(0, mobile ? 0.05 : 0, 0)

    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const bob = awake ? Math.sin(t * 1.4) * 0.02 : 0
    const idleWiggle = awake && !dragRef.current.active ? Math.sin(t * 0.35) * 0.06 : 0

    groupRef.current.position.x = robotX
    groupRef.current.position.y = -0.12 + bob
    groupRef.current.rotation.y = spinY.current + idleWiggle
  })

  const mouth = [
    new Vector3(-0.1, HEAD_Y - 0.06, 0.24),
    new Vector3(0.1, HEAD_Y - 0.06, 0.24),
  ]

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 3, 4]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-2, 1, 2]} intensity={0.5} color={ACCENT} />

      <group ref={groupRef} position={[robotX, 0, 0]}>
        <mesh position={[0, HEAD_Y + HEAD_HEIGHT * 0.5 + 0.12, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.14, 6]} />
          <meshBasicMaterial color={MUTED} transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, HEAD_Y + HEAD_HEIGHT * 0.5 + 0.22, 0]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={awake ? 0.9 : 0.4} />
        </mesh>

        <mesh position={[0, HEAD_Y, 0]}>
          <boxGeometry args={[0.58, HEAD_HEIGHT, 0.48]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, HEAD_Y, 0]}>
          <boxGeometry args={[0.58, HEAD_HEIGHT, 0.48]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.04} />
        </mesh>

        <mesh position={[-0.14, HEAD_Y + 0.06, 0.26]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={awake ? 0.85 : 0.35} />
        </mesh>
        <mesh position={[0.14, HEAD_Y + 0.06, 0.26]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={awake ? 0.85 : 0.35} />
        </mesh>
        <mesh position={[-0.14, HEAD_Y + 0.06, 0.28]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.95} />
        </mesh>
        <mesh position={[0.14, HEAD_Y + 0.06, 0.28]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.95} />
        </mesh>

        <Line points={mouth} color={ACCENT} transparent opacity={awake ? 0.7 : 0.3} />

        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.38]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.48} />
        </mesh>

        <mesh position={[-0.38, 0.05, 0]} rotation={[0, 0, 10.35]}>
          <boxGeometry args={[0.36, 0.14, 0.14]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.4} />
        </mesh>
        <mesh position={[0.38, 0.05, 0]} rotation={[0, 0, -10.35]}>
          <boxGeometry args={[0.36, 0.14, 0.14]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.4} />
        </mesh>

        <mesh position={[-0.14, -0.45, 0.08]}>
          <boxGeometry args={[0.14, 0.3, 0.16]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.38} />
        </mesh>
        <mesh position={[0.14, -0.45, 0.08]}>
          <boxGeometry args={[0.14, 0.3, 0.16]} />
          <meshBasicMaterial color={MUTED} wireframe transparent opacity={0.38} />
        </mesh>
      </group>
    </>
  )
}

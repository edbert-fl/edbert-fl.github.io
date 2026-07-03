import { Float, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'
import type { Group } from 'three'

const STEPS: Array<{
  position: [number, number, number]
  scale: number
}> = [
  { position: [-2.1, -1.6, 0.2], scale: 0.75 },
  { position: [-1.1, -0.85, -0.35], scale: 0.85 },
  { position: [0, -0.1, 0.45], scale: 0.95 },
  { position: [1.05, 0.75, -0.2], scale: 1.05 },
  { position: [2.15, 1.55, 0.35], scale: 1.15 },
]

function TimelineStep({
  position,
  scale,
  index,
}: {
  position: [number, number, number]
  scale: number
  index: number
}) {
  return (
    <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.35}>
      <group position={position} scale={scale}>
        <mesh>
          <boxGeometry args={[1.4, 0.06, 0.7]} />
          <meshBasicMaterial color="#f4f4f5" wireframe transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.55, 8]} />
          <meshBasicMaterial color="#f4f4f5" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshBasicMaterial color={index % 2 === 0 ? '#f4f4f5' : '#22d3ee'} />
        </mesh>
      </group>
    </Float>
  )
}

export function ExperienceScene() {
  const groupRef = useRef<Group>(null)

  const pathPoints = useMemo(
    () => STEPS.map((step) => new Vector3(...step.position).add(new Vector3(0, 0.72, 0))),
    [],
  )

  const pathCurve = useMemo(() => new CatmullRomCurve3(pathPoints), [pathPoints])
  const pathGeometry = useMemo(() => {
    const points = pathCurve.getPoints(48)
    return points
  }, [pathCurve])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = t * 0.1
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.06
  })

  return (
    <>
      <ambientLight intensity={0.32} />
      <pointLight position={[0, 2, 4]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-3, -1, 2]} intensity={0.45} color="#22d3ee" />

      <group ref={groupRef}>
        {STEPS.map((step, index) => (
          <TimelineStep key={index} position={step.position} scale={step.scale} index={index} />
        ))}

        <Line points={pathGeometry} color="#22d3ee" transparent opacity={0.65} />

        <mesh position={[0, 0, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 8, 20, 12]} />
          <meshBasicMaterial color="#f4f4f5" wireframe transparent opacity={0.05} />
        </mesh>
      </group>
    </>
  )
}

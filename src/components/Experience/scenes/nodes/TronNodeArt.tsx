import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { Vector3 } from 'three'
import { type NodeArtworkProps, wireOpacity } from './pipelineTheme'

const DESK_ROWS = [
  { z: 0.12, seats: [-0.42, -0.14, 0.14, 0.42] },
  { z: 0.34, seats: [-0.5, -0.17, 0.17, 0.5] },
  { z: 0.52, seats: [-0.5, -0.17, 0.17, 0.5] },
]

const BOARD_LINES = [-0.18, -0.06, 0.06, 0.18]

const ROOM_CORNERS = [
  new Vector3(-0.85, -0.42, 0.72),
  new Vector3(0.85, -0.42, 0.72),
  new Vector3(0.85, -0.42, 0.72),
  new Vector3(0.85, 0.55, -0.72),
  new Vector3(0.85, 0.55, -0.72),
  new Vector3(-0.85, 0.55, -0.72),
  new Vector3(-0.85, 0.55, -0.72),
  new Vector3(-0.85, -0.42, 0.72),
]

export function TronNodeArt({ active, color, dimColor }: NodeArtworkProps) {
  const boardRef = useRef<Mesh>(null)
  const teacherRef = useRef<Group>(null)
  const pointerRef = useRef<Group>(null)
  const studentRefs = useRef<(Mesh | null)[]>([])

  const pointerLine = useMemo(
    () => [new Vector3(0, 0, 0), new Vector3(-0.02, 0.2, -0.38)],
    [],
  )

  const studentCount = useMemo(
    () => DESK_ROWS.reduce((total, row) => total + row.seats.length, 0),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (boardRef.current) {
      const material = boardRef.current.material
      if (material && 'opacity' in material) {
        const target = active ? 0.14 + Math.sin(t * 2.5) * 0.06 : 0.05
        material.opacity += (target - material.opacity) * 0.08
      }
    }

    if (teacherRef.current) {
      teacherRef.current.position.y = Math.sin(t * 0.9) * 0.02
    }

    if (pointerRef.current) {
      pointerRef.current.rotation.z = Math.sin(t * (active ? 1.4 : 0.6)) * 0.12 - 0.08
    }

    const litStudent = active ? Math.floor(t * 1.8) % studentCount : -1
    studentRefs.current.forEach((student, index) => {
      if (!student) return
      const material = student.material
      if (!material || !('opacity' in material)) return
      const isLit = index === litStudent
      const target = active ? (isLit ? 0.95 : 0.45) : 0.3
      material.opacity += (target - material.opacity) * 0.12
    })
  })

  let studentIndex = 0

  return (
    <group rotation={[0.08, -0.22, 0]}>
      <Line
        points={ROOM_CORNERS}
        color={dimColor}
        transparent
        opacity={active ? 0.28 : 0.14}
      />

      <mesh position={[0, -0.42, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.75, 1.35, 6, 4]} />
        <meshBasicMaterial color={dimColor} wireframe transparent opacity={0.18} />
      </mesh>

      <group position={[0, 0.12, -0.62]}>
        <mesh>
          <boxGeometry args={[1.05, 0.62, 0.04]} />
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={wireOpacity(active, 0.32, 0.68)}
          />
        </mesh>

        <mesh ref={boardRef} position={[0, 0, 0.025]}>
          <planeGeometry args={[0.88, 0.48]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>

        {BOARD_LINES.map((y, index) => (
          <mesh key={index} position={[0, y, 0.03]}>
            <boxGeometry args={[0.72, 0.02, 0.01]} />
            <meshBasicMaterial
              color={index === 0 ? color : dimColor}
              transparent
              opacity={active ? 0.55 : 0.25}
            />
          </mesh>
        ))}
      </group>

      <group ref={teacherRef} position={[0.05, -0.08, -0.22]}>
        <mesh position={[0, 0.38, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={wireOpacity(active, 0.4, 0.75)} />
        </mesh>

        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.14, 0.28, 0.1]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={wireOpacity(active, 0.35, 0.65)} />
        </mesh>

        <group ref={pointerRef} position={[0.07, 0.26, 0.04]}>
          <Line points={pointerLine} color={color} transparent opacity={active ? 0.7 : 0.35} />
          <mesh position={[-0.02, 0.2, -0.38]} rotation={[0.35, 0, 0.4]}>
            <coneGeometry args={[0.035, 0.1, 6]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 0.85 : 0.4} />
          </mesh>
        </group>
      </group>

      {DESK_ROWS.map((row, rowIndex) =>
        row.seats.map((x) => {
          const currentIndex = studentIndex++
          return (
            <group key={`${rowIndex}-${x}`} position={[x, -0.28, row.z]}>
              <mesh>
                <boxGeometry args={[0.28, 0.06, 0.2]} />
                <meshBasicMaterial
                  color={dimColor}
                  wireframe
                  transparent
                  opacity={wireOpacity(active, 0.22, 0.42)}
                />
              </mesh>

              <mesh
                ref={(node) => {
                  studentRefs.current[currentIndex] = node
                }}
                position={[0, 0.14, 0]}
              >
                <sphereGeometry args={[0.055, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
              </mesh>
            </group>
          )
        }),
      )}
    </group>
  )
}

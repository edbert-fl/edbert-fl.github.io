import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { DoubleSide, Vector3 } from 'three'
import {
  WORK_ACCENT,
  WORK_ART_LIFT,
  WORK_DIM,
  WORK_MUTED,
  type WorkArtProps,
  workWireOpacity,
} from './workArtTheme'

const BODY_W = 0.5
const BODY_H = 0.96
const BODY_D = 0.42
const FREEZER_SPLIT = 0.28
const BODY_CENTER_Y = 0.34
const OPEN_ANGLE = Math.PI * 0.58

type FoodId =
  | 'apple'
  | 'broccoli'
  | 'carton'
  | 'carrot'
  | 'orange'
  | 'greens'
  | 'banana'
  | 'yogurt'
  | 'bottle'
  | 'grapes'
  | 'pepper'
  | 'lemon'
  | 'cucumber'
  | 'cheese'
  | 'eggs'
  | 'tomato'
  | 'avocado'

const SHELF_Y = [0.18, -0.02, -0.22] as const
const ROW_SPACING = 0.092
const SHELF_DEPTH_BACK = -0.11
const SHELF_DEPTH_FRONT = 0.03

function rowXPositions(count: number): number[] {
  const spacing = count >= 5 ? 0.084 : ROW_SPACING
  const span = (count - 1) * spacing
  return Array.from({ length: count }, (_, i) => -span / 2 + i * spacing)
}

function buildShelfFood(): { id: FoodId; pos: [number, number, number] }[] {
  const shelves: { y: number; z: number; items: FoodId[] }[] = [
    { y: SHELF_Y[0], z: SHELF_DEPTH_BACK, items: ['carton', 'yogurt', 'cheese', 'bottle'] },
    { y: SHELF_Y[1], z: SHELF_DEPTH_BACK, items: ['broccoli', 'pepper', 'grapes', 'greens', 'cucumber'] },
    { y: SHELF_Y[2], z: SHELF_DEPTH_BACK, items: ['apple', 'orange', 'lemon', 'tomato', 'avocado'] },
    { y: SHELF_Y[2], z: SHELF_DEPTH_FRONT, items: ['carrot', 'banana', 'eggs'] },
  ]

  return shelves.flatMap(({ y, z, items }) => {
    const xs = rowXPositions(items.length)
    return items.map((id, i) => ({
      id,
      pos: [xs[i], y, z] as [number, number, number],
    }))
  })
}

const HEALTHY_FOOD = buildShelfFood()

function FoodMaterial() {
  return <meshBasicMaterial color={WORK_ACCENT} wireframe transparent opacity={0} />
}

function HealthyFoodItem({
  id,
  position,
  baseY,
}: {
  id: FoodId
  position: [number, number, number]
  baseY: number
}) {
  const y = baseY + position[1]
  const pos: [number, number, number] = [position[0], y, position[2]]

  if (id === 'apple' || id === 'orange' || id === 'lemon' || id === 'tomato') {
    const scale = id === 'lemon' ? 0.85 : id === 'tomato' ? 0.95 : 1
    return (
      <mesh position={pos} scale={scale}>
        <sphereGeometry args={[0.042, 10, 10]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'broccoli') {
    return (
      <group position={pos}>
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <FoodMaterial />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.01, 0.014, 0.045, 6]} />
          <FoodMaterial />
        </mesh>
      </group>
    )
  }

  if (id === 'carton' || id === 'eggs') {
    const size = id === 'eggs' ? [0.09, 0.04, 0.07] as const : [0.065, 0.09, 0.055] as const
    return (
      <mesh position={pos}>
        <boxGeometry args={[...size]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'carrot') {
    return (
      <mesh position={pos} rotation={[0, 0.3, Math.PI / 2]}>
        <coneGeometry args={[0.016, 0.09, 8]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'banana') {
    return (
      <mesh position={pos} rotation={[0, 0.2, 0.55]}>
        <cylinderGeometry args={[0.013, 0.017, 0.1, 8]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'yogurt') {
    return (
      <mesh position={pos}>
        <cylinderGeometry args={[0.035, 0.038, 0.055, 10]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'bottle') {
    return (
      <group position={pos}>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.08, 8]} />
          <FoodMaterial />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 6]} />
          <FoodMaterial />
        </mesh>
      </group>
    )
  }

  if (id === 'grapes') {
    const offsets: [number, number, number][] = [
      [0, 0, 0],
      [0.022, -0.01, 0.01],
      [-0.02, -0.012, 0.008],
      [0.01, -0.022, -0.01],
      [-0.012, 0.015, -0.012],
    ]
    return (
      <group position={pos}>
        {offsets.map(([ox, oy, oz], i) => (
          <mesh key={i} position={[ox, oy, oz]}>
            <sphereGeometry args={[0.016, 6, 6]} />
            <FoodMaterial />
          </mesh>
        ))}
      </group>
    )
  }

  if (id === 'pepper') {
    return (
      <mesh position={pos} scale={[0.9, 1.1, 0.9]}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'cucumber') {
    return (
      <mesh position={pos} rotation={[0, 0.5, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.1, 8]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'cheese') {
    return (
      <mesh position={pos} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.07, 0.05, 0.07]} />
        <FoodMaterial />
      </mesh>
    )
  }

  if (id === 'avocado') {
    return (
      <group position={pos} rotation={[0.2, 0.3, 0]}>
        <mesh scale={[0.85, 1.15, 0.85]}>
          <sphereGeometry args={[0.038, 8, 8]} />
          <FoodMaterial />
        </mesh>
        <mesh position={[0, 0.02, 0.02]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <FoodMaterial />
        </mesh>
      </group>
    )
  }

  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.08, 0.05]} />
      <meshBasicMaterial color={WORK_ACCENT} wireframe transparent opacity={0} side={DoubleSide} />
    </mesh>
  )
}

export function FridgeArt({ active }: WorkArtProps) {
  const groupRef = useRef<Group>(null)
  const doorPivotRef = useRef<Group>(null)
  const interiorRef = useRef<Group>(null)
  const lightRef = useRef<Mesh>(null)
  const doorOpenRef = useRef(0)

  const wireOpacity = workWireOpacity(active)
  const splitY = BODY_CENTER_Y + BODY_H / 2 - BODY_H * FREEZER_SPLIT
  const fridgeDoorH = BODY_H * (1 - FREEZER_SPLIT) - 0.02
  const fridgeDoorCenterY = BODY_CENTER_Y - BODY_H / 2 + fridgeDoorH / 2 + 0.01
  const hingeX = -BODY_W / 2
  const frontZ = BODY_D / 2

  const frontOutline = useMemo(() => {
    const hw = BODY_W / 2
    const hh = BODY_H / 2
    const z = frontZ + 0.002
    const y0 = BODY_CENTER_Y - hh
    const y1 = BODY_CENTER_Y + hh
    return [
      new Vector3(-hw, y0, z),
      new Vector3(hw, y0, z),
      new Vector3(hw, y1, z),
      new Vector3(-hw, y1, z),
      new Vector3(-hw, y0, z),
    ]
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      const bob = active ? Math.sin(t * 1.4) * 0.018 : 0
      groupRef.current.position.y = WORK_ART_LIFT + bob
      groupRef.current.rotation.y = active ? Math.sin(t * 0.45) * 0.04 : 0
    }

    const targetOpen = active ? 1 : 0
    doorOpenRef.current += (targetOpen - doorOpenRef.current) * Math.min(1, delta * 2.8)

    if (doorPivotRef.current) {
      doorPivotRef.current.rotation.y = -doorOpenRef.current * OPEN_ANGLE
    }

    if (interiorRef.current) {
      interiorRef.current.visible = doorOpenRef.current > 0.04
      const foodOpacity = Math.min(1, doorOpenRef.current * 1.35) * 0.82
      interiorRef.current.traverse((child) => {
        if (!(child instanceof Object) || !('material' in child)) return
        const mesh = child as Mesh
        const material = mesh.material
        if (!material || !('opacity' in material)) return
        if (mesh === lightRef.current) return
        material.opacity = foodOpacity
      })
    }

    if (lightRef.current) {
      const material = lightRef.current.material
      if (material && 'opacity' in material) {
        const target = 0.04 + doorOpenRef.current * (0.16 + Math.sin(t * 2.2) * 0.04)
        material.opacity += (target - material.opacity) * 0.12
      }
    }
  })

  const handleX = BODY_W / 2 - 0.05

  return (
    <group ref={groupRef}>
      <mesh position={[0, BODY_CENTER_Y, 0]}>
        <boxGeometry args={[BODY_W, BODY_H, BODY_D]} />
        <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity} />
      </mesh>

      <Line points={frontOutline} color={WORK_ACCENT} transparent opacity={active ? 0.55 : 0.28} />

      <Line
        points={[
          new Vector3(-BODY_W / 2, splitY, frontZ + 0.003),
          new Vector3(BODY_W / 2, splitY, frontZ + 0.003),
        ]}
        color={WORK_DIM}
        transparent
        opacity={0.45}
      />

      <mesh position={[handleX, splitY - 0.12, frontZ + 0.012]}>
        <boxGeometry args={[0.028, 0.14, 0.02]} />
        <meshBasicMaterial color={WORK_ACCENT} wireframe transparent opacity={active ? 0.65 : 0.32} />
      </mesh>

      <mesh position={[0, splitY - (BODY_CENTER_Y + BODY_H / 2 - splitY) / 2, frontZ + 0.008]}>
        <boxGeometry args={[BODY_W * 0.98, BODY_H * FREEZER_SPLIT - 0.04, 0.012]} />
        <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity * 0.95} />
      </mesh>

      <group ref={interiorRef} visible={false}>
        <mesh ref={lightRef} position={[0, fridgeDoorCenterY, -BODY_D / 2 + 0.025]}>
          <planeGeometry args={[BODY_W * 0.78, fridgeDoorH * 0.88]} />
          <meshBasicMaterial color={WORK_ACCENT} transparent opacity={0.05} />
        </mesh>

        {SHELF_Y.map((offsetY) => (
          <Line
            key={offsetY}
            points={[
              new Vector3(-BODY_W / 2 + 0.05, fridgeDoorCenterY + offsetY - 0.03, -BODY_D / 2 + 0.03),
              new Vector3(BODY_W / 2 - 0.08, fridgeDoorCenterY + offsetY - 0.03, -BODY_D / 2 + 0.03),
            ]}
            color={WORK_DIM}
            transparent
            opacity={0.35}
          />
        ))}

        {HEALTHY_FOOD.map((item) => (
          <HealthyFoodItem
            key={item.id}
            id={item.id}
            position={item.pos}
            baseY={fridgeDoorCenterY}
          />
        ))}
      </group>

      <group ref={doorPivotRef} position={[hingeX, fridgeDoorCenterY, frontZ]}>
        <mesh position={[BODY_W / 2, 0, 0.006]}>
          <boxGeometry args={[BODY_W, fridgeDoorH, 0.014]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity} />
        </mesh>

        <mesh position={[BODY_W - 0.05, 0.02, 0.012]}>
          <boxGeometry args={[0.03, fridgeDoorH * 0.42, 0.02]} />
          <meshBasicMaterial color={WORK_ACCENT} wireframe transparent opacity={active ? 0.75 : 0.38} />
        </mesh>
      </group>

      {[
        [-0.18, BODY_CENTER_Y - BODY_H / 2 - 0.02],
        [0.18, BODY_CENTER_Y - BODY_H / 2 - 0.02],
        [-0.18, BODY_CENTER_Y - BODY_H / 2 + 0.02],
        [0.18, BODY_CENTER_Y - BODY_H / 2 + 0.02],
      ].map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.06]}>
          <boxGeometry args={[0.05, 0.03, 0.05]} />
          <meshBasicMaterial color={WORK_MUTED} wireframe transparent opacity={wireOpacity * 0.85} />
        </mesh>
      ))}
    </group>
  )
}

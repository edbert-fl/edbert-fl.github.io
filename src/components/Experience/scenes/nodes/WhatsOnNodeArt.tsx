import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import { type NodeArtworkProps, wireOpacity } from './pipelineTheme'

const SITE_PANELS = [
  { position: [-0.95, 0.15, 0.15] as [number, number, number], width: 0.72, height: 0.52, lines: 3 },
  { position: [0, 0.35, 0] as [number, number, number], width: 0.82, height: 0.58, lines: 4 },
  { position: [0.95, 0.05, -0.1] as [number, number, number], width: 0.7, height: 0.5, lines: 3 },
]

function SitePanel({
  width,
  height,
  lines,
  color,
  dimColor,
  active,
}: {
  width: number
  height: number
  lines: number
  color: string
  dimColor: string
  active: boolean
}) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[width, height, 0.03]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={wireOpacity(active, 0.32, 0.68)} />
      </mesh>
      <mesh position={[0, height * 0.38, 0.02]}>
        <boxGeometry args={[width * 0.88, 0.05, 0.01]} />
        <meshBasicMaterial color={dimColor} wireframe transparent opacity={0.35} />
      </mesh>
      {Array.from({ length: lines }, (_, index) => (
        <mesh
          key={index}
          position={[-width * 0.2, height * 0.12 - index * 0.1, 0.025]}
        >
          <boxGeometry args={[width * (0.7 - index * 0.08), 0.025, 0.01]} />
          <meshBasicMaterial color={index === 0 ? color : dimColor} transparent opacity={active ? 0.5 : 0.25} />
        </mesh>
      ))}
    </group>
  )
}

export function WhatsOnNodeArt({ active, color, dimColor }: NodeArtworkProps) {
  const hubRef = useRef<Mesh>(null)
  const panelsRef = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (hubRef.current) {
      const material = hubRef.current.material
      if (material && 'opacity' in material) {
        const target = active ? 0.12 : 0.04
        material.opacity += (target - material.opacity) * 0.08
      }
    }
    if (panelsRef.current) {
      panelsRef.current.rotation.y = Math.sin(t * (active ? 0.35 : 0.15)) * 0.08
    }
  })

  return (
    <group>
      <mesh ref={hubRef}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={wireOpacity(active, 0.35, 0.75)} />
      </mesh>

      <group ref={panelsRef}>
        {SITE_PANELS.map((panel, index) => (
          <group key={index} position={panel.position}>
            <SitePanel
              width={panel.width}
              height={panel.height}
              lines={panel.lines}
              color={color}
              dimColor={dimColor}
              active={active}
            />
          </group>
        ))}
      </group>
    </group>
  )
}

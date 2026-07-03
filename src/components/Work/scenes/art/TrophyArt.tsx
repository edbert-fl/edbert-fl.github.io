import { Line, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import type { Group, MeshBasicMaterial, Texture } from 'three'
import { AdditiveBlending, SRGBColorSpace, Vector3 } from 'three'
import { WORK_ART_LIFT } from './workArtTheme'

const ACCENT = '#22d3ee'
const MUTED = '#f4f4f5'
const ATLASSIAN_LOGO_URL = '/logos/atlassian.png'
const UNIHACK_LOGO_URL = '/logos/unihack.png'
const LOGO_REVEAL_DELAY_S = 1
const LOGO_FADE_IN_S = 0.45
const LOGO_HEIGHT = 0.1
const LOGO_GAP = 0.034

interface TrophyArtProps {
  active: boolean
}

function getLogoSize(texture: Texture, height: number) {
  const image = texture.image as { width?: number; height?: number } | undefined
  const aspect =
    image?.width && image?.height && image.height > 0 ? image.width / image.height : 3
  return { width: height * aspect, height }
}

function TrophyLogo({
  texture,
  position,
  size,
  materialRef,
}: {
  texture: Texture
  position: [number, number, number]
  size: { width: number; height: number }
  materialRef: RefObject<MeshBasicMaterial | null>
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[size.width, size.height]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        blending={AdditiveBlending}
      />
    </mesh>
  )
}

export function TrophyArt({ active }: TrophyArtProps) {
  const groupRef = useRef<Group>(null)
  const atlassianMaterialRef = useRef<MeshBasicMaterial>(null)
  const unihackMaterialRef = useRef<MeshBasicMaterial>(null)
  const logoOpacityRef = useRef(0)
  const activeSinceRef = useRef<number | null>(null)
  const [atlassianTexture, unihackTexture] = useTexture([ATLASSIAN_LOGO_URL, UNIHACK_LOGO_URL])

  useEffect(() => {
    atlassianTexture.colorSpace = SRGBColorSpace
    unihackTexture.colorSpace = SRGBColorSpace
  }, [atlassianTexture, unihackTexture])

  useEffect(() => {
    if (active) {
      activeSinceRef.current = performance.now()
      return
    }

    activeSinceRef.current = null
    logoOpacityRef.current = 0
    if (atlassianMaterialRef.current) atlassianMaterialRef.current.opacity = 0
    if (unihackMaterialRef.current) unihackMaterialRef.current.opacity = 0
  }, [active])

  const atlassianSize = useMemo(
    () => getLogoSize(atlassianTexture, LOGO_HEIGHT),
    [atlassianTexture],
  )
  const unihackSize = useMemo(() => getLogoSize(unihackTexture, LOGO_HEIGHT), [unihackTexture])

  const atlassianY = 0.3
  const unihackY = atlassianY + LOGO_HEIGHT + LOGO_GAP

  const leftHandle = useMemo(
    () => [
      new Vector3(-0.22, 0.42, 0),
      new Vector3(-0.34, 0.28, 0),
      new Vector3(-0.3, 0.12, 0),
    ],
    [],
  )

  const rightHandle = useMemo(
    () => [
      new Vector3(0.22, 0.42, 0),
      new Vector3(0.34, 0.28, 0),
      new Vector3(0.3, 0.12, 0),
    ],
    [],
  )

  const star = useMemo(() => {
    const points: Vector3[] = []
    for (let i = 0; i < 5; i += 1) {
      const outer = (i / 5) * Math.PI * 2 - Math.PI / 2
      const inner = outer + Math.PI / 5
      points.push(new Vector3(Math.cos(outer) * 0.1, 0.8 + Math.sin(outer) * 0.1, 0.02))
      points.push(new Vector3(Math.cos(inner) * 0.04, 0.8 + Math.sin(inner) * 0.04, 0.02))
    }
    points.push(points[0].clone())
    return points
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const bob = active ? Math.sin(t * 1.6) * 0.025 : 0
    const spin = active ? Math.sin(t * 0.5) * 0.06 : 0
    groupRef.current.position.y = WORK_ART_LIFT + bob
    groupRef.current.rotation.y = spin

    let targetOpacity = 0
    if (active && activeSinceRef.current !== null) {
      const elapsed = (performance.now() - activeSinceRef.current) / 1000
      if (elapsed >= LOGO_REVEAL_DELAY_S) {
        targetOpacity = Math.min(1, (elapsed - LOGO_REVEAL_DELAY_S) / LOGO_FADE_IN_S)
      }
    }

    logoOpacityRef.current += (targetOpacity - logoOpacityRef.current) * 0.12
    const opacity = logoOpacityRef.current
    if (atlassianMaterialRef.current) atlassianMaterialRef.current.opacity = opacity
    if (unihackMaterialRef.current) unihackMaterialRef.current.opacity = opacity
  })

  const wireOpacity = active ? 0.78 : 0.38
  const fillOpacity = active ? 0.08 : 0.03

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.24, 0.34, 0.42, 12, 1, true]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={wireOpacity} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.24, 0.34, 0.42, 12, 1, true]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={fillOpacity} />
      </mesh>

      <TrophyLogo
        texture={unihackTexture}
        position={[0, unihackY, 0.35]}
        size={unihackSize}
        materialRef={unihackMaterialRef}
      />
      <TrophyLogo
        texture={atlassianTexture}
        position={[0, atlassianY, 0.35]}
        size={atlassianSize}
        materialRef={atlassianMaterialRef}
      />

      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.3, 0.24, 0.08, 12]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={wireOpacity} />
      </mesh>

      <Line points={leftHandle} color={ACCENT} transparent opacity={active ? 0.85 : 0.45} />
      <Line points={rightHandle} color={ACCENT} transparent opacity={active ? 0.85 : 0.45} />

      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.18, 8]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={wireOpacity * 0.9} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.06, 10]} />
        <meshBasicMaterial color={MUTED} wireframe transparent opacity={wireOpacity * 0.85} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[0.34, 0.05, 0.34]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={active ? 0.65 : 0.32} />
      </mesh>

      <Line points={star} color={ACCENT} transparent opacity={active ? 0.95 : 0.5} />
    </group>
  )
}

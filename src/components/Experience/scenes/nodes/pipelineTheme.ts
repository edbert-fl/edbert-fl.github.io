export const PIPELINE_ACCENT = '#22d3ee'
export const PIPELINE_MUTED = '#f4f4f5'
export const PIPELINE_DIM = '#a1a1aa'

export interface NodeArtworkProps {
  active: boolean
  color: string
  dimColor: string
}

export function wireOpacity(active: boolean, base = 0.34, activeOpacity = 0.72) {
  return active ? activeOpacity : base
}

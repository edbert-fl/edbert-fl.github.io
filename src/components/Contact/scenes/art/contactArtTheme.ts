export const CONTACT_ACCENT = '#22d3ee'
export const CONTACT_MUTED = '#f4f4f5'
export const CONTACT_DIM = '#a1a1aa'

export interface ContactArtProps {
  active: boolean
  color?: string
  dimColor?: string
}

export function contactWireOpacity(active: boolean, base = 0.34, activeOpacity = 0.78) {
  return active ? activeOpacity : base
}

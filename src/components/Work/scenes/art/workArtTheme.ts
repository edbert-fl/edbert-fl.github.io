export const WORK_ACCENT = '#22d3ee'
export const WORK_MUTED = '#f4f4f5'
export const WORK_DIM = '#a1a1aa'

/** Shared podium art height; trophy baseline. */
export const WORK_ART_LIFT = 0.72
/** Target visual centroid in local art space (matches trophy). */
export const WORK_ART_VISUAL_CENTER_Y = 0.2

export interface WorkArtProps {
  active: boolean
}

export function workWireOpacity(active: boolean, base = 0.32, activeOpacity = 0.72) {
  return active ? activeOpacity : base
}

export type ExperienceNodeVariant = 'enterprise' | 'analytics' | 'web' | 'research' | 'education'

export interface ExperienceSite {
  label: string
  url: string
}

export interface ExperienceRole {
  id: string
  company: string
  title: string
  schedule?: string
  period: string
  highlights: string[]
  sites?: ExperienceSite[]
  logo: string
  nodeVariant: ExperienceNodeVariant
  nodeScale: number
}

/** Newest → earliest */
export const EXPERIENCE_ROLES: ExperienceRole[] = [
  {
    id: 'tron',
    company: 'Tron Technologies',
    title: 'Contract Software Engineer',
    schedule: '3 days/week',
    period: '02/2026 to 04/2026',
    logo: '/logos/tron-technologies.png',
    highlights: [
      'Developed front-end for an educational research platform for a Sydney-based social enterprise focused on digital learning tools for schools and endangered animal awareness.',
    ],
    nodeVariant: 'education',
    nodeScale: 0.82,
  },
  {
    id: 'usyd',
    company: 'University of Sydney',
    title: 'Research Assistant',
    schedule: '2 days/week',
    period: '07/2025 to 06/2026',
    logo: '/logos/university-of-sydney.png',
    highlights: [
      'Built video processing pipeline with UNSW School of Optometry to detect distortions in microscopic eye images using computer vision.',
      'Contributed to a tool helping optometrists stitch microscopic images for an atlas of the eye, improving visualization and diagnostic reference.',
    ],
    nodeVariant: 'research',
    nodeScale: 1.0,
  },
  {
    id: 'netpoleon',
    company: 'Netpoleon ANZ',
    title: 'Contract Software Engineer',
    schedule: '2 days/week',
    period: '06/2025 to 12/2025',
    logo: '/logos/netpoleon.png',
    sites: [{ label: 'netpoleons.com.au', url: 'https://netpoleons.com.au/' }],
    highlights: [
      'Built and shipped the public Netpoleon ANZ website: cybersecurity positioning, partner ecosystem, and contact flows with analytics (+30% contact inquiries).',
      'Integrated CMS with third-party tooling, automating workflows and reducing manual data handling.',
    ],
    nodeVariant: 'web',
    nodeScale: 0.88,
  },
  {
    id: 'whatson',
    company: 'What’s On!',
    title: 'Lead Software Engineer',
    period: '09/2024 to 06/2025',
    logo: '/logos/whats-on.png',
    sites: [
      { label: 'knowwhatson.com', url: 'https://knowwhatson.com' },
      { label: 'setuindia.au', url: 'https://www.setuindia.au' },
    ],
    highlights: [
      'Led data analytics products used by 4,000+ users, including platforms for the High Commission of India (SETU), City of Sydney, and UNSW.',
      'Built corporate web properties, CI/CD pipelines, and deployment workflows across the product lifecycle.',
    ],
    nodeVariant: 'analytics',
    nodeScale: 1.2,
  },
  {
    id: 'ascend',
    company: 'Ascend ERP Solutions',
    title: 'Software Developer',
    period: '11/2023 to 09/2024',
    logo: '/logos/ascend-erp.png',
    highlights: [
      'Designed a tool for tracking land acquisitions for Indonesia’s state coal mining company, integrating it with legacy enterprise systems and improving data flow efficiency by 40%.',
      'Built and optimized ETL pipelines to extract, transform, and load data from legacy systems, PDFs, and photos into modern data infrastructure.',
    ],
    nodeVariant: 'enterprise',
    nodeScale: 0.95,
  },
]

/**
 * Pipeline positions: index 0 = newest → index 4 = earliest.
 * Netpoleon (index 2) sits on a lateral branch, parallel to USyd (index 1)
 * but offset in Z so the two artworks don't stack together.
 */
export const PIPELINE_NODE_POSITIONS: [number, number, number][] = [
  [5.0, 3.8, 0.05], // tron
  [2.4, 2.0, 0.12], // usyd, main path
  [3.4, 0.55, -2.2], // netpoleon, branch (closer to camera path)
  [-2.4, -1.1, 0.12], // whatson
  [-5.0, -3.8, 0.05], // ascend
]

/** Per-node camera pull-in: distance along +Z, height above node */
export const PIPELINE_NODE_CAMERA = [
  { distance: 3.8, height: 0.35 },
  { distance: 2.65, height: 0.3 },
  { distance: 2.5, height: 0.28 },
  { distance: 3.6, height: 0.35 },
  { distance: 3.8, height: 0.35 },
] as const

export const PIPELINE_ROLE_COUNT = EXPERIENCE_ROLES.length

export function getPipelineFloatIndex(pathProgress: number) {
  return pathProgress * (PIPELINE_ROLE_COUNT - 1)
}

export function getNodeFocus(index: number, floatIndex: number) {
  return Math.max(0, 1 - Math.abs(index - floatIndex) * 0.85)
}

/** Parallel contract branch: USyd ↔ Netpoleon */
export const PIPELINE_BRANCH_INDICES: [number, number] = [1, 2]

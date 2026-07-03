export type WorkArtwork = 'coin' | 'fridge' | 'research-graph' | 'livestock-pose' | 'marketing-chatbot'

export type WorkCategory = 'commercial' | 'hackathon' | 'research'

export interface WorkProject {
  id: string
  title: string
  badge?: string
  awards?: string[]
  award?: string
  description: string
  tech: string[]
  category: WorkCategory
  artwork?: WorkArtwork
  links?: { label: string; url: string }[]
}

export const WORK_PROJECTS: WorkProject[] = [
  {
    id: 'crypto-gateway',
    title: 'Cryptarity',
    awards: [
      'Best Design, UNIHACK X Atlassian',
      'Community Service Prize',
      'Most Awards, Cryptarity',
    ],
    category: 'hackathon',
    artwork: 'coin',
    description:
      'Built a crypto payment gateway for charities. Stored transaction metadata in AstraDB and used vector embeddings for fraud detection. Won Best Design and an award from Atlassian at UNIHACK 2025.',
    tech: ['Next.js', 'Web3.js', 'AstraDB', 'OpenAI API'],
  },
  {
    id: 'myfridge',
    title: 'MyFridge',
    badge: 'UNIHACK X Atlassian Best Design for My Fridge',
    category: 'hackathon',
    artwork: 'fridge',
    description:
      'Food management app that scans receipts to offer healthy grocery shopping tips and sends expiration reminders.',
    tech: ['Next.js', 'React', 'OCR', 'Node.js'],
    links: [
      {
        label: 'devpost.com',
        url: 'https://devpost.com/software/myfridge-slnhme',
      },
    ],
  },
  {
    id: 'agentic-research',
    title: 'Agentic Client Research Agent',
    category: 'commercial',
    artwork: 'research-graph',
    description:
      'Built a research automation tool to generate detailed client profiles for outreach and sales. Scraped lead data from Apollo and used an agentic workflow to perform multi-step reasoning.',
    tech: ['Python', 'Playwright', 'BeautifulSoup', 'N8N', 'Apollo API', 'OpenAI API'],
  },
  {
    id: 'ai-marketing-chatbot',
    title: 'AI Marketing Chatbot',
    badge: 'Ascend ERP | Client Project',
    category: 'commercial',
    artwork: 'marketing-chatbot',
    description:
      'Built a customer-facing marketing chatbot for an Ascend ERP client. Integrated OpenAI with customer-level data for personalized interactions, implemented RAG over PDFs, text files, and websites, and enabled prescripted flows to drive engagement and support.',
    tech: ['OpenAI API', 'RAG', 'Python', 'Next.js', 'Supabase', 'PDF Processing'],
  },
  {
    id: 'livestock-pose',
    title: 'Real-Time Video Livestock Pose Detection',
    badge: 'University of Sydney | Research',
    category: 'research',
    artwork: 'livestock-pose',
    description:
      'Research project with the University of Sydney to detect and classify cattle behaviours (standing, lying, walking, and feeding) from images and video. Implemented deep learning-based pose estimation with YOLOv8 and built tooling to curate and annotate livestock datasets: mapping keypoints, classifying images, and augmenting training data.',
    tech: ['PyTorch', 'OpenCV', 'YOLOv8', 'Python'],
  },
]

export const WORK_PODIUM_SPACING = 3.4

export function getWorkFloatIndex(progress: number) {
  const max = WORK_PROJECTS.length - 1
  return Math.min(max, Math.max(0, progress * max))
}

export function getWorkFocus(index: number, floatIndex: number) {
  const distance = Math.abs(index - floatIndex)
  return Math.max(0, 1 - distance * 1.15)
}

export function getWorkScrollTop(section: HTMLElement, index: number) {
  const max = WORK_PROJECTS.length - 1
  if (max <= 0) return section.offsetTop

  const progress = index / max
  const scrollable = section.offsetHeight - window.innerHeight
  return section.offsetTop + progress * Math.max(0, scrollable)
}

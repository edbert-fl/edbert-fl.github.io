import { useId, useState } from 'react'
import { YouTubeScaleCdn } from './YouTubeScaleCdn'
import { YouTubeScaleTopology } from './YouTubeScaleTopology'
import './YouTubeScaleFaq.css'

type ScaleVisual = 'topology' | 'postgres' | 'cdn' | 'media'

interface ScaleFaqItem {
  id: string
  question: string
  paragraphs: string[]
  visual?: ScaleVisual
}

const SCALE_FAQ: ScaleFaqItem[] = [
  {
    id: 'api-workers',
    question: 'How would the API and workers scale?',
    paragraphs: [
      'On AWS ECS with Fargate, scale the API as a service of N tasks (same Docker image) behind an Application Load Balancer. ALB is the single HTTPS entrypoint: health-checked routing across tasks, and clients never care which replica answered. Because the API is stateless (JWT), any task can serve any call. Fargate means no EC2 nodes to babysit; you set CPU/memory and desired count.',
      'Workers are a second ECS service and Docker image (FFmpeg included). Scale them to M tasks as SQS consumers by raising desired count (or autoscaling on queue depth), not by putting them behind the ALB. Local Docker Compose already runs both images; ECS/Fargate is the same unit of deploy with independent counts for API and workers.',
    ],
    visual: 'topology',
  },
  {
    id: 'containers',
    question: 'Why containers instead of a serverless-first API?',
    paragraphs: [
      'A serverless-first API (API Gateway + Lambda) was rejected for this project. The system is a long-running .NET service plus CPU-heavy media workers. Containers preserve local Docker parity, fit EF Core and RDS access patterns, and keep one operational model that maps cleanly to ECS on Fargate.',
      'Serverless would complicate the API without solving transcoding, which still needs long-running containerized workers.',
    ],
  },
  {
    id: 'postgres',
    question: 'What happens when Postgres gets hot?',
    paragraphs: [
      'Grow the data plane in stages before rewriting the app. Start with a larger managed instance and the indexes the feed and ownership queries actually need. Add connection pooling (PgBouncer) when connection churn becomes the bottleneck. Introduce a read replica for feed-heavy reads if the primary stays write-bound.',
    ],
    visual: 'postgres',
  },
  {
    id: 'cdn',
    question: 'How do watch and thumbnails stay fast at scale?',
    paragraphs: [
      'Public and unlisted Ready already play through adaptive HLS. Next is putting CloudFront (or another CDN) in front of the media path so repeat GETs for playlists and segments stay off the API, while edges only hold what regional demand makes hot.',
      'Private HLS still waits on signed-cookie CDN work; until then private watch stays progressive MP4.',
    ],
    visual: 'cdn',
  },
  {
    id: 'feed-abuse',
    question: 'What about hot feeds and abuse?',
    paragraphs: [
      'If the home feed becomes hot, add a shared cache (Redis) for the public Ready list and short-TTL search snippets. Rate limiting and per-user quotas are already on the roadmap so upload and auth endpoints degrade gracefully under abuse instead of melting the API.',
    ],
  },
  {
    id: 'search',
    question: 'How does search evolve?',
    paragraphs: [
      'Title search can start as SQL ILIKE while the corpus is small. When relevance, volume, or ranking needs grow, move search to OpenSearch or Elasticsearch and keep Postgres as the source of truth for ownership and visibility.',
    ],
  }
]

function PostgresLadder() {
  const steps = [
    { label: 'Instance size', note: 'Managed Postgres vertical headroom' },
    { label: 'Indexes', note: 'Feed, ownership, status filters' },
    { label: 'PgBouncer', note: 'Pool connections across API replicas' },
    { label: 'Read replica', note: 'Offload feed-heavy reads' },
  ]

  return (
    <ol className="ytc-scale-ladder" aria-label="Postgres growth stages">
      {steps.map((step, index) => (
        <li key={step.label}>
          <span className="ytc-scale-ladder__num">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <span className="ytc-scale-ladder__label">{step.label}</span>
            <span className="ytc-scale-ladder__note">{step.note}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

function MediaNext() {
  return (
    <div className="ytc-scale-next" aria-label="Media format now versus next">
      <div>
        <span className="ytc-scale-next__eyebrow">Now</span>
        <p>LQ + HQ MP4 objects</p>
      </div>
      <span className="ytc-scale-next__arrow" aria-hidden="true">
        →
      </span>
      <div>
        <span className="ytc-scale-next__eyebrow">Next</span>
        <p>HLS / DASH + ABR</p>
      </div>
    </div>
  )
}

function ScaleVisual({ kind }: { kind: ScaleVisual }) {
  if (kind === 'topology') return <YouTubeScaleTopology />
  if (kind === 'postgres') return <PostgresLadder />
  if (kind === 'cdn') return <YouTubeScaleCdn />
  return <MediaNext />
}

export function YouTubeScaleFaq() {
  const baseId = useId()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['api-workers']))

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="ytc-scale-faq">
      {SCALE_FAQ.map((item) => {
        const open = openIds.has(item.id)
        const panelId = `${baseId}-${item.id}-panel`
        const buttonId = `${baseId}-${item.id}-button`

        return (
          <div
            key={item.id}
            className={`ytc-scale-faq__item${open ? ' ytc-scale-faq__item--open' : ''}`}
          >
            <h3 className="ytc-scale-faq__question">
              <button
                id={buttonId}
                type="button"
                className="ytc-scale-faq__trigger"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span>{item.question}</span>
                <span className="ytc-scale-faq__icon" aria-hidden="true">
                  {open ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="ytc-scale-faq__panel"
              hidden={!open}
            >
              <div className="ytc-scale-faq__answer-body">
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {item.visual && <ScaleVisual kind={item.visual} />}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import './YouTubeScaleTopology.css'

const API_REPLICAS = [
  { id: 'api-1', x: 156 },
  { id: 'api-2', x: 388 },
  { id: 'api-3', x: 620 },
] as const

const WORKERS = [
  { id: 'w-1', x: 156 },
  { id: 'w-2', x: 388 },
  { id: 'w-3', x: 620 },
] as const

const BOX_W = 144
const BOX_H = 78
const ALB_CX = 460
const ALB_Y = 88
const API_Y = 220
const SQS_Y = 380
const WORKER_Y = 500

/**
 * Runtime topology: clients → ALB → Kubernetes API pods × N;
 * worker pods × M pull from SQS (not behind ALB).
 */
export function YouTubeScaleTopology() {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const inView = useInView(rootRef, { once: true, margin: '-10%' })
  const entered = !!reduceMotion || inView
  const animate = entered && !reduceMotion

  return (
    <figure
      ref={rootRef}
      className={[
        'ytc-scale-topo',
        entered ? 'ytc-scale-topo--entered' : '',
        reduceMotion ? 'ytc-scale-topo--static' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Horizontal scale on Kubernetes. Clients hit one Application Load Balancer. The ALB fans requests across N health-checked API pods from a Docker image. Any API pod can enqueue a transcode job to SQS. M worker pods, from a Docker image with FFmpeg, pull jobs from SQS and are not behind the ALB. Scale each Deployment by raising replica count."
    >
      <ul className="ytc-scale-topo__legend" aria-hidden="true">
        <li>
          <i className="ytc-scale-topo__swatch ytc-scale-topo__swatch--http" /> ALB → API pods
        </li>
        <li>
          <i className="ytc-scale-topo__swatch ytc-scale-topo__swatch--queue" /> Enqueue
        </li>
        <li>
          <i className="ytc-scale-topo__swatch ytc-scale-topo__swatch--note" /> Worker pods pull
        </li>
      </ul>

      <div className="ytc-scale-topo__canvas">
        <svg
          className="ytc-scale-topo__svg"
          viewBox="0 0 920 620"
          role="presentation"
          focusable="false"
        >
          <defs>
            <marker
              id="ytc-scale-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22d3ee" />
            </marker>
            <marker
              id="ytc-scale-arrow-hot"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f87171" />
            </marker>
          </defs>

          <text x="28" y="56" className="ytc-scale-topo__lane">
            Edge
          </text>
          <text x="28" y="258" className="ytc-scale-topo__lane">
            K8s · API
          </text>
          <text x="28" y="410" className="ytc-scale-topo__lane">
            Queue
          </text>
          <text x="28" y="538" className="ytc-scale-topo__lane ytc-scale-topo__lane--hot">
            K8s · Worker
          </text>

          <rect
            x="132"
            y={API_Y - 36}
            width="656"
            height={BOX_H + 58}
            rx="3"
            className="ytc-scale-topo__cluster"
          />
          <text x="148" y={API_Y - 14} className="ytc-scale-topo__cluster-label">
            Kubernetes Deployment · image: api · replicas: N
          </text>

          <rect
            x="132"
            y={WORKER_Y - 36}
            width="656"
            height={BOX_H + 58}
            rx="3"
            className="ytc-scale-topo__cluster ytc-scale-topo__cluster--worker"
          />
          <text
            x="148"
            y={WORKER_Y - 14}
            className="ytc-scale-topo__cluster-label ytc-scale-topo__cluster-label--hot"
          >
            Kubernetes Deployment · image: worker · FFmpeg · replicas: M
          </text>

          <g className="ytc-scale-topo__wires" fill="none" strokeWidth="1.4">
            <path
              id="ytc-scale-path-client"
              d={`M ${ALB_CX} 52 V ${ALB_Y}`}
              stroke="#22d3ee"
              strokeOpacity="0.55"
              markerEnd="url(#ytc-scale-arrow)"
            />

            {API_REPLICAS.map((api) => {
              const targetX = api.x + BOX_W / 2
              return (
                <path
                  key={`alb-${api.id}`}
                  id={`ytc-scale-path-${api.id}`}
                  d={`M ${ALB_CX} ${ALB_Y + 56} C ${ALB_CX} ${ALB_Y + 110}, ${targetX} ${API_Y - 40}, ${targetX} ${API_Y}`}
                  stroke="#22d3ee"
                  strokeOpacity="0.65"
                  markerEnd="url(#ytc-scale-arrow)"
                />
              )
            })}

            {API_REPLICAS.map((api) => {
              const fromX = api.x + BOX_W / 2
              return (
                <path
                  key={`enq-${api.id}`}
                  id={`ytc-scale-enq-${api.id}`}
                  d={`M ${fromX} ${API_Y + BOX_H} C ${fromX} ${API_Y + BOX_H + 42}, ${ALB_CX} ${SQS_Y - 42}, ${ALB_CX} ${SQS_Y}`}
                  stroke="#22d3ee"
                  strokeOpacity="0.4"
                  strokeDasharray="6 5"
                  markerEnd="url(#ytc-scale-arrow)"
                />
              )
            })}

            {WORKERS.map((worker) => {
              const toX = worker.x + BOX_W / 2
              return (
                <path
                  key={`pull-${worker.id}`}
                  id={`ytc-scale-pull-${worker.id}`}
                  d={`M ${ALB_CX} ${SQS_Y + 56} C ${ALB_CX} ${SQS_Y + 100}, ${toX} ${WORKER_Y - 36}, ${toX} ${WORKER_Y}`}
                  stroke="#f87171"
                  strokeOpacity="0.7"
                  strokeDasharray="5 4"
                  markerEnd="url(#ytc-scale-arrow-hot)"
                />
              )
            })}
          </g>

          <g className="ytc-scale-topo__blocks">
            <rect
              x={ALB_CX - 70}
              y={12}
              width={140}
              height={40}
              rx={2}
              className="ytc-scale-topo__box"
            />
            <text x={ALB_CX} y={37} textAnchor="middle" className="ytc-scale-topo__label">
              Clients
            </text>

            <rect
              x={ALB_CX - 130}
              y={ALB_Y}
              width={260}
              height={56}
              rx={2}
              className="ytc-scale-topo__box ytc-scale-topo__box--accent"
            />
            <text x={ALB_CX} y={ALB_Y + 24} textAnchor="middle" className="ytc-scale-topo__label">
              Application Load Balancer
            </text>
            <text x={ALB_CX} y={ALB_Y + 42} textAnchor="middle" className="ytc-scale-topo__sub">
              HTTPS · health checks · fan-out to pods
            </text>

            {API_REPLICAS.map((api) => (
              <g key={api.id}>
                <rect
                  x={api.x}
                  y={API_Y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={2}
                  className="ytc-scale-topo__box ytc-scale-topo__box--container"
                />
                <rect
                  x={api.x + 8}
                  y={API_Y + 8}
                  width={40}
                  height={16}
                  rx={1}
                  className="ytc-scale-topo__badge"
                />
                <text
                  x={api.x + 28}
                  y={API_Y + 19.5}
                  textAnchor="middle"
                  className="ytc-scale-topo__badge-text"
                >
                  pod
                </text>
                <rect
                  x={api.x + 52}
                  y={API_Y + 8}
                  width={52}
                  height={16}
                  rx={1}
                  className="ytc-scale-topo__badge"
                />
                <text
                  x={api.x + 78}
                  y={API_Y + 19.5}
                  textAnchor="middle"
                  className="ytc-scale-topo__badge-text"
                >
                  docker
                </text>
                <text
                  x={api.x + BOX_W / 2}
                  y={API_Y + 46}
                  textAnchor="middle"
                  className="ytc-scale-topo__label"
                >
                  {api.id}
                </text>
                <text
                  x={api.x + BOX_W / 2}
                  y={API_Y + 64}
                  textAnchor="middle"
                  className="ytc-scale-topo__sub"
                >
                  JWT · any replica
                </text>
              </g>
            ))}

            <rect
              x={ALB_CX - 130}
              y={SQS_Y}
              width={260}
              height={56}
              rx={2}
              className="ytc-scale-topo__box ytc-scale-topo__box--queue"
            />
            <text x={ALB_CX} y={SQS_Y + 24} textAnchor="middle" className="ytc-scale-topo__label">
              SQS
            </text>
            <text x={ALB_CX} y={SQS_Y + 42} textAnchor="middle" className="ytc-scale-topo__sub">
              Transcode jobs · buffer spikes
            </text>

            {WORKERS.map((worker) => (
              <g key={worker.id}>
                <rect
                  x={worker.x}
                  y={WORKER_Y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={2}
                  className="ytc-scale-topo__box ytc-scale-topo__box--worker"
                />
                <rect
                  x={worker.x + 8}
                  y={WORKER_Y + 8}
                  width={40}
                  height={16}
                  rx={1}
                  className="ytc-scale-topo__badge ytc-scale-topo__badge--hot"
                />
                <text
                  x={worker.x + 28}
                  y={WORKER_Y + 19.5}
                  textAnchor="middle"
                  className="ytc-scale-topo__badge-text ytc-scale-topo__badge-text--hot"
                >
                  pod
                </text>
                <rect
                  x={worker.x + 52}
                  y={WORKER_Y + 8}
                  width={52}
                  height={16}
                  rx={1}
                  className="ytc-scale-topo__badge ytc-scale-topo__badge--hot"
                />
                <text
                  x={worker.x + 78}
                  y={WORKER_Y + 19.5}
                  textAnchor="middle"
                  className="ytc-scale-topo__badge-text ytc-scale-topo__badge-text--hot"
                >
                  docker
                </text>
                <text
                  x={worker.x + BOX_W / 2}
                  y={WORKER_Y + 46}
                  textAnchor="middle"
                  className="ytc-scale-topo__label"
                >
                  {worker.id}
                </text>
                <text
                  x={worker.x + BOX_W / 2}
                  y={WORKER_Y + 64}
                  textAnchor="middle"
                  className="ytc-scale-topo__sub"
                >
                  pull · FFmpeg
                </text>
              </g>
            ))}

            <text x={ALB_CX} y={604} textAnchor="middle" className="ytc-scale-topo__footnote">
              Compose images on Kubernetes · workers not behind the ALB
            </text>
          </g>

          {animate && (
            <g className="ytc-scale-topo__packets" aria-hidden="true">
              {API_REPLICAS.map((api, index) => (
                <circle
                  key={`pkt-api-${api.id}`}
                  r="3.5"
                  className="ytc-scale-topo__packet"
                >
                  <animateMotion
                    dur={`${1.8 + index * 0.25}s`}
                    repeatCount="indefinite"
                    begin={`${index * 0.35}s`}
                  >
                    <mpath href={`#ytc-scale-path-${api.id}`} />
                  </animateMotion>
                </circle>
              ))}
              {WORKERS.map((worker, index) => (
                <circle
                  key={`pkt-w-${worker.id}`}
                  r="3.5"
                  className="ytc-scale-topo__packet ytc-scale-topo__packet--hot"
                >
                  <animateMotion
                    dur={`${2.1 + index * 0.2}s`}
                    repeatCount="indefinite"
                    begin={`${0.6 + index * 0.4}s`}
                  >
                    <mpath href={`#ytc-scale-pull-${worker.id}`} />
                  </animateMotion>
                </circle>
              ))}
            </g>
          )}
        </svg>
      </div>
    </figure>
  )
}

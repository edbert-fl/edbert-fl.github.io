import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import './YouTubeScaleTopology.css'

const API_REPLICAS = [
  { id: 'api-1', x: 180, y: 168 },
  { id: 'api-2', x: 400, y: 168 },
  { id: 'api-3', x: 620, y: 168 },
] as const

const WORKERS = [
  { id: 'w-1', x: 180, y: 372 },
  { id: 'w-2', x: 400, y: 372 },
  { id: 'w-3', x: 620, y: 372 },
] as const

const BOX_W = 120
const BOX_H = 56
const ALB_CX = 460
const ALB_Y = 72
const SQS_Y = 278

/**
 * Runtime topology for future horizontal scale:
 * clients → ALB fan-out to API×N; workers×M independently pull from SQS.
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
      aria-label="Horizontal scale topology. Clients hit one Application Load Balancer. The ALB fans requests out across multiple health-checked API replicas. Any API replica can enqueue a transcode job to SQS. Multiple workers pull jobs from SQS independently and are not behind the ALB."
    >
      <ul className="ytc-scale-topo__legend" aria-hidden="true">
        <li>
          <i className="ytc-scale-topo__swatch ytc-scale-topo__swatch--http" /> ALB fan-out
        </li>
        <li>
          <i className="ytc-scale-topo__swatch ytc-scale-topo__swatch--queue" /> Enqueue
        </li>
        <li>
          <i className="ytc-scale-topo__swatch ytc-scale-topo__swatch--note" /> Worker pull
        </li>
      </ul>

      <div className="ytc-scale-topo__canvas">
        <svg
          className="ytc-scale-topo__svg"
          viewBox="0 0 920 460"
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

          {/* Lane labels */}
          <text x="36" y="56" className="ytc-scale-topo__lane">
            Edge
          </text>
          <text x="36" y="198" className="ytc-scale-topo__lane">
            API × N
          </text>
          <text x="36" y="308" className="ytc-scale-topo__lane">
            Queue
          </text>
          <text x="36" y="402" className="ytc-scale-topo__lane ytc-scale-topo__lane--hot">
            Workers × M
          </text>

          <g className="ytc-scale-topo__wires" fill="none" strokeWidth="1.4">
            {/* Clients → ALB */}
            <path
              id="ytc-scale-path-client"
              d={`M ${ALB_CX} 48 V ${ALB_Y}`}
              stroke="#22d3ee"
              strokeOpacity="0.55"
              markerEnd="url(#ytc-scale-arrow)"
            />

            {/* ALB fan-out to each API replica */}
            {API_REPLICAS.map((api) => {
              const targetX = api.x + BOX_W / 2
              const targetY = api.y
              return (
                <path
                  key={`alb-${api.id}`}
                  id={`ytc-scale-path-${api.id}`}
                  d={`M ${ALB_CX} ${ALB_Y + 52} C ${ALB_CX} ${ALB_Y + 96}, ${targetX} ${targetY - 36}, ${targetX} ${targetY}`}
                  stroke="#22d3ee"
                  strokeOpacity="0.65"
                  markerEnd="url(#ytc-scale-arrow)"
                />
              )
            })}

            {/* Each API → SQS enqueue */}
            {API_REPLICAS.map((api) => {
              const fromX = api.x + BOX_W / 2
              const fromY = api.y + BOX_H
              const toX = ALB_CX
              const toY = SQS_Y
              return (
                <path
                  key={`enq-${api.id}`}
                  id={`ytc-scale-enq-${api.id}`}
                  d={`M ${fromX} ${fromY} C ${fromX} ${fromY + 34}, ${toX} ${toY - 34}, ${toX} ${toY}`}
                  stroke="#22d3ee"
                  strokeOpacity="0.4"
                  strokeDasharray="6 5"
                  markerEnd="url(#ytc-scale-arrow)"
                />
              )
            })}

            {/* SQS fan-out pull to each worker */}
            {WORKERS.map((worker) => {
              const toX = worker.x + BOX_W / 2
              const toY = worker.y
              return (
                <path
                  key={`pull-${worker.id}`}
                  id={`ytc-scale-pull-${worker.id}`}
                  d={`M ${ALB_CX} ${SQS_Y + 52} C ${ALB_CX} ${SQS_Y + 88}, ${toX} ${toY - 28}, ${toX} ${toY}`}
                  stroke="#f87171"
                  strokeOpacity="0.7"
                  strokeDasharray="5 4"
                  markerEnd="url(#ytc-scale-arrow-hot)"
                />
              )
            })}
          </g>

          <g className="ytc-scale-topo__blocks">
            {/* Clients */}
            <rect
              x={ALB_CX - 70}
              y={8}
              width={140}
              height={40}
              rx={2}
              className="ytc-scale-topo__box"
            />
            <text x={ALB_CX} y={33} textAnchor="middle" className="ytc-scale-topo__label">
              Clients
            </text>

            {/* ALB */}
            <rect
              x={ALB_CX - 130}
              y={ALB_Y}
              width={260}
              height={52}
              rx={2}
              className="ytc-scale-topo__box ytc-scale-topo__box--accent"
            />
            <text x={ALB_CX} y={ALB_Y + 22} textAnchor="middle" className="ytc-scale-topo__label">
              Application Load Balancer
            </text>
            <text x={ALB_CX} y={ALB_Y + 40} textAnchor="middle" className="ytc-scale-topo__sub">
              HTTPS · health checks · fan-out
            </text>

            {/* API replicas as separate boxes */}
            {API_REPLICAS.map((api) => (
              <g key={api.id}>
                <rect
                  x={api.x}
                  y={api.y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={2}
                  className="ytc-scale-topo__box"
                />
                <text
                  x={api.x + BOX_W / 2}
                  y={api.y + 24}
                  textAnchor="middle"
                  className="ytc-scale-topo__label"
                >
                  {api.id}
                </text>
                <text
                  x={api.x + BOX_W / 2}
                  y={api.y + 42}
                  textAnchor="middle"
                  className="ytc-scale-topo__sub"
                >
                  JWT · any replica
                </text>
              </g>
            ))}

            {/* SQS */}
            <rect
              x={ALB_CX - 130}
              y={SQS_Y}
              width={260}
              height={52}
              rx={2}
              className="ytc-scale-topo__box ytc-scale-topo__box--queue"
            />
            <text x={ALB_CX} y={SQS_Y + 22} textAnchor="middle" className="ytc-scale-topo__label">
              SQS
            </text>
            <text x={ALB_CX} y={SQS_Y + 40} textAnchor="middle" className="ytc-scale-topo__sub">
              Transcode jobs · buffer spikes
            </text>

            {/* Workers as separate boxes */}
            {WORKERS.map((worker) => (
              <g key={worker.id}>
                <rect
                  x={worker.x}
                  y={worker.y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={2}
                  className="ytc-scale-topo__box ytc-scale-topo__box--worker"
                />
                <text
                  x={worker.x + BOX_W / 2}
                  y={worker.y + 24}
                  textAnchor="middle"
                  className="ytc-scale-topo__label"
                >
                  {worker.id}
                </text>
                <text
                  x={worker.x + BOX_W / 2}
                  y={worker.y + 42}
                  textAnchor="middle"
                  className="ytc-scale-topo__sub"
                >
                  Pull · FFmpeg
                </text>
              </g>
            ))}

            <text
              x={ALB_CX}
              y={448}
              textAnchor="middle"
              className="ytc-scale-topo__footnote"
            >
              Workers are not behind the ALB
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

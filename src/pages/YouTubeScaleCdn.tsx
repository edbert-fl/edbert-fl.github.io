import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import './YouTubeScaleCdn.css'

/**
 * Two-column CDN story: hot demand served at a regional edge (HIT),
 * cold / long-tail misses through to S3 origin (MISS).
 */
export function YouTubeScaleCdn() {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const inView = useInView(rootRef, { once: true, margin: '-10%' })
  const entered = !!reduceMotion || inView
  const animate = entered && !reduceMotion

  return (
    <figure
      ref={rootRef}
      className={[
        'ytc-scale-cdn',
        entered ? 'ytc-scale-cdn--entered' : '',
        reduceMotion ? 'ytc-scale-cdn--static' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Same playback path, two outcomes. Left: a Sydney viewer requests a popular title; the nearby edge already holds it and serves a HIT without leaving the region. Right: a Virginia viewer requests a long-tail title; the edge misses and fetches from the S3 origin, which keeps the full library. Edges only cache what regional demand makes hot."
    >
      <div className="ytc-scale-cdn__headers" aria-hidden="true">
        <div className="ytc-scale-cdn__header ytc-scale-cdn__header--hit">
          <span className="ytc-scale-cdn__eyebrow">Hot · regional demand</span>
          <strong>HIT</strong>
          <span>Served at the edge</span>
        </div>
        <div className="ytc-scale-cdn__header ytc-scale-cdn__header--miss">
          <span className="ytc-scale-cdn__eyebrow">Cold · long-tail</span>
          <strong>MISS</strong>
          <span>Continues to origin</span>
        </div>
      </div>

      <div className="ytc-scale-cdn__canvas">
        <svg
          className="ytc-scale-cdn__svg"
          viewBox="0 0 920 460"
          role="presentation"
          focusable="false"
        >
          <defs>
            <marker
              id="ytc-cdn-arrow"
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
              id="ytc-cdn-arrow-muted"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a1a1aa" />
            </marker>
          </defs>

          {/* Center divider */}
          <line
            x1="460"
            y1="16"
            x2="460"
            y2="420"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          <g className="ytc-scale-cdn__wires" fill="none" strokeWidth="1.5">
            {/* HOT column */}
            <path
              id="ytc-cdn-hot-1"
              d="M230 78 V118"
              stroke="#22d3ee"
              strokeOpacity="0.7"
              markerEnd="url(#ytc-cdn-arrow)"
            />
            <path
              id="ytc-cdn-hot-stop"
              d="M230 214 V248"
              stroke="#22d3ee"
              strokeOpacity="0.45"
              strokeDasharray="4 5"
            />

            {/* COLD column */}
            <path
              id="ytc-cdn-cold-1"
              d="M690 78 V118"
              stroke="#a1a1aa"
              strokeOpacity="0.75"
              markerEnd="url(#ytc-cdn-arrow-muted)"
            />
            <path
              id="ytc-cdn-cold-2"
              d="M690 214 V286"
              stroke="#a1a1aa"
              strokeOpacity="0.75"
              strokeDasharray="5 4"
              markerEnd="url(#ytc-cdn-arrow-muted)"
            />
          </g>

          <g className="ytc-scale-cdn__blocks">
            {/* —— HOT column (left) —— */}
            <rect x="140" y="28" width="180" height="50" rx="2" className="ytc-scale-cdn__box" />
            <text x="230" y="50" textAnchor="middle" className="ytc-scale-cdn__label">
              Viewer · Sydney
            </text>
            <text x="230" y="66" textAnchor="middle" className="ytc-scale-cdn__sub">
              Requests popular title
            </text>

            <rect
              x="120"
              y="118"
              width="220"
              height="96"
              rx="2"
              className="ytc-scale-cdn__box ytc-scale-cdn__box--edge"
            />
            <text x="230" y="144" textAnchor="middle" className="ytc-scale-cdn__label">
              Edge · ap-southeast-2
            </text>
            <text x="230" y="162" textAnchor="middle" className="ytc-scale-cdn__sub">
              Already cached from local demand
            </text>
            <rect x="148" y="176" width="78" height="24" rx="2" className="ytc-scale-cdn__chip" />
            <text x="187" y="192" textAnchor="middle" className="ytc-scale-cdn__chip-text">
              vid_hot
            </text>
            <rect x="234" y="176" width="78" height="24" rx="2" className="ytc-scale-cdn__chip" />
            <text x="273" y="192" textAnchor="middle" className="ytc-scale-cdn__chip-text">
              thumb
            </text>

            <rect
              x="150"
              y="248"
              width="160"
              height="44"
              rx="2"
              className="ytc-scale-cdn__box ytc-scale-cdn__box--stop"
            />
            <text x="230" y="268" textAnchor="middle" className="ytc-scale-cdn__label">
              Stops here
            </text>
            <text x="230" y="284" textAnchor="middle" className="ytc-scale-cdn__sub">
              No origin trip
            </text>

            <text x="230" y="330" textAnchor="middle" className="ytc-scale-cdn__ghost">
              Origin not needed
            </text>

            {/* —— COLD column (right) —— */}
            <rect x="600" y="28" width="180" height="50" rx="2" className="ytc-scale-cdn__box" />
            <text x="690" y="50" textAnchor="middle" className="ytc-scale-cdn__label">
              Viewer · Virginia
            </text>
            <text x="690" y="66" textAnchor="middle" className="ytc-scale-cdn__sub">
              Requests long-tail title
            </text>

            <rect
              x="580"
              y="118"
              width="220"
              height="96"
              rx="2"
              className="ytc-scale-cdn__box ytc-scale-cdn__box--edge-miss"
            />
            <text x="690" y="144" textAnchor="middle" className="ytc-scale-cdn__label">
              Edge · us-east-1
            </text>
            <text x="690" y="162" textAnchor="middle" className="ytc-scale-cdn__sub">
              Not in this region’s cache
            </text>
            <rect
              x="612"
              y="176"
              width="156"
              height="24"
              rx="2"
              className="ytc-scale-cdn__chip ytc-scale-cdn__chip--empty"
            />
            <text x="690" y="192" textAnchor="middle" className="ytc-scale-cdn__chip-muted">
              vid_cold not cached
            </text>

            <rect
              x="580"
              y="286"
              width="220"
              height="96"
              rx="2"
              className="ytc-scale-cdn__box ytc-scale-cdn__box--origin"
            />
            <text x="690" y="314" textAnchor="middle" className="ytc-scale-cdn__label">
              S3 origin · full library
            </text>
            <text x="690" y="332" textAnchor="middle" className="ytc-scale-cdn__sub">
              Every Ready object lives here
            </text>
            <rect
              x="608"
              y="346"
              width="52"
              height="22"
              rx="2"
              className="ytc-scale-cdn__chip"
            />
            <text x="634" y="361" textAnchor="middle" className="ytc-scale-cdn__chip-text">
              hot
            </text>
            <rect
              x="668"
              y="346"
              width="52"
              height="22"
              rx="2"
              className="ytc-scale-cdn__chip ytc-scale-cdn__chip--cold"
            />
            <text x="694" y="361" textAnchor="middle" className="ytc-scale-cdn__chip-muted">
              cold
            </text>
            <rect
              x="728"
              y="346"
              width="52"
              height="22"
              rx="2"
              className="ytc-scale-cdn__chip ytc-scale-cdn__chip--cold"
            />
            <text x="754" y="361" textAnchor="middle" className="ytc-scale-cdn__chip-muted">
              cold
            </text>
          </g>

          {animate && (
            <g className="ytc-scale-cdn__packets" aria-hidden="true">
              <circle r="3.5" className="ytc-scale-cdn__packet">
                <animateMotion dur="1.5s" repeatCount="indefinite">
                  <mpath href="#ytc-cdn-hot-1" />
                </animateMotion>
              </circle>
              <circle r="3.5" className="ytc-scale-cdn__packet ytc-scale-cdn__packet--muted">
                <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.2s">
                  <mpath href="#ytc-cdn-cold-1" />
                </animateMotion>
              </circle>
              <circle r="3.5" className="ytc-scale-cdn__packet ytc-scale-cdn__packet--muted">
                <animateMotion dur="1.8s" repeatCount="indefinite" begin="1s">
                  <mpath href="#ytc-cdn-cold-2" />
                </animateMotion>
              </circle>
            </g>
          )}
        </svg>
      </div>

      <p className="ytc-scale-cdn__footer">
        Edges cache what regional demand makes hot. Origin keeps the full library.
      </p>
    </figure>
  )
}

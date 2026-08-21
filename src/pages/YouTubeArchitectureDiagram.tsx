import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import './YouTubeArchitectureDiagram.css'

/** One upload we follow; others are just ahead/behind in the queue. */
const QUEUE_JOBS = [
  { id: 'vid_91c', role: 'waiting', hot: false },
  { id: 'vid_7b1', role: 'waiting', hot: false },
  { id: 'vid_02e', role: 'waiting', hot: false },
  { id: 'vid_a3f', role: 'this upload', hot: true },
]

const STEPS = [
  'Session + metadata',
  'Direct S3 PUT',
  'Complete → enqueue (back)',
  'Dequeue (front)',
  'Encode → Ready',
] as const

const easeOut = [0.22, 1, 0.36, 1] as const

/**
 * Upload-path schematic unique to the YouTube Clone case study.
 * One video: session → S3 PUT → complete/enqueue → dequeue → encode → Ready.
 */
export function YouTubeArchitectureDiagram() {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const inView = useInView(rootRef, { once: true, margin: '-12%' })
  const entered = !!reduceMotion || inView

  return (
    <figure
      ref={rootRef}
      className={[
        'ytc-schematic',
        entered ? 'ytc-schematic--entered' : '',
        reduceMotion ? 'ytc-schematic--static' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Upload flow for one video. Step 1: browser creates an upload session with the API, which stores a video row in Postgres. Step 2: browser uploads the file directly to S3 with a pre-signed URL. Step 3: browser completes the upload; the API enqueues a transcode job at the back of an SQS queue. Step 4: the worker dequeues from the front of the queue. Step 5: the worker writes LQ, HQ, and thumbnail objects to S3 and marks the video Ready in Postgres."
    >
      <ol className="ytc-schematic__steps">
        {STEPS.map((label, index) => (
          <motion.li
            key={label}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: easeOut }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span> {label}
          </motion.li>
        ))}
      </ol>

      <div className="ytc-schematic__canvas">
        <svg
          className="ytc-schematic__svg"
          viewBox="0 0 960 580"
          role="presentation"
          focusable="false"
        >
          <defs>
            <marker
              id="ytc-arrow"
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
              id="ytc-arrow-hot"
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

          {/* Wires */}
          <g className="ytc-schematic__wires" fill="none" strokeWidth="1.4">
            {/* 01 Browser → API */}
            <path
              id="path-session"
              d="M290 108 H410"
              stroke="#22d3ee"
              strokeOpacity="0.55"
              markerEnd="url(#ytc-arrow)"
            />
            {/* API → Postgres */}
            <path
              id="path-meta"
              d="M530 168 V236"
              stroke="#22d3ee"
              strokeOpacity="0.4"
              markerEnd="url(#ytc-arrow)"
            />
            {/* 02 Browser → S3 (smooth media-plane arc) */}
            <path
              id="path-put"
              d="M100 168 C40 280, 40 470, 288 470"
              stroke="#22d3ee"
              strokeOpacity="0.55"
              strokeDasharray="7 5"
              strokeLinecap="round"
              markerEnd="url(#ytc-arrow)"
            />
            {/* 03 API → queue back (top) */}
            <path
              id="path-enqueue"
              d="M650 100 H718"
              stroke="#22d3ee"
              strokeOpacity="0.6"
              markerEnd="url(#ytc-arrow)"
            />
            {/* 04 Queue front (bottom) → Worker */}
            <path
              id="path-dequeue"
              d="M820 360 V418"
              stroke="#f87171"
              strokeOpacity="0.75"
              markerEnd="url(#ytc-arrow-hot)"
            />
            {/* 05 Worker → S3 */}
            <path
              id="path-render"
              d="M640 468 H500"
              stroke="#22d3ee"
              strokeDasharray="5 6"
              strokeOpacity="0.5"
              markerEnd="url(#ytc-arrow)"
            />
            {/* Worker → Postgres Ready: down, left, up */}
            <path
              id="path-ready"
              d="M740 520 V555 H530 V336"
              stroke="#22d3ee"
              strokeOpacity="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#ytc-arrow)"
            />

            {/* Invisible path: one upload, edge → edge only (never through boxes) */}
            <path
              id="path-journey"
              d="
                M290 108 H410
                M530 168 V236
                M100 168 C40 280, 40 470, 288 470
                M650 100 H718
                M820 360 V418
                M640 470 H502
                M740 520 V555 H530 V336
              "
              fill="none"
              stroke="none"
            />
          </g>

          {/* Step badges on wires */}
          <g className="ytc-schematic__badges">
            <g transform="translate(338, 92)">
              <circle r="11" className="ytc-schematic__badge" />
              <text textAnchor="middle" dy="3.5" className="ytc-schematic__badge-text">
                01
              </text>
            </g>
            <g transform="translate(48, 320)">
              <circle r="11" className="ytc-schematic__badge ytc-schematic__badge--accent" />
              <text textAnchor="middle" dy="3.5" className="ytc-schematic__badge-text">
                02
              </text>
            </g>
            <g transform="translate(678, 84)">
              <circle r="11" className="ytc-schematic__badge" />
              <text textAnchor="middle" dy="3.5" className="ytc-schematic__badge-text">
                03
              </text>
            </g>
            <g transform="translate(820, 384)">
              <circle r="11" className="ytc-schematic__badge ytc-schematic__badge--hot" />
              <text textAnchor="middle" dy="3.5" className="ytc-schematic__badge-text">
                04
              </text>
            </g>
            <g transform="translate(560, 452)">
              <circle r="11" className="ytc-schematic__badge" />
              <text textAnchor="middle" dy="3.5" className="ytc-schematic__badge-text">
                05
              </text>
            </g>
          </g>

          {!reduceMotion && (
            <g className="ytc-schematic__packets">
              <circle r="5" className="ytc-schematic__tracer" fill="#67e8f9">
                <animateMotion dur="16s" repeatCount="indefinite">
                  <mpath href="#path-journey" />
                </animateMotion>
                <animate
                  attributeName="fill"
                  dur="16s"
                  repeatCount="indefinite"
                  values="#22d3ee;#22d3ee;#67e8f9;#22d3ee;#f87171;#67e8f9;#22d3ee;#22d3ee"
                  keyTimes="0;0.14;0.32;0.48;0.58;0.72;0.88;1"
                />
              </circle>
            </g>
          )}

          {/* Browser */}
          <g className="ytc-schematic__block" style={{ ['--ytc-enter-delay' as string]: '0.05s' }} transform="translate(30, 58)">
            <rect
              width="260"
              height="110"
              rx="2"
              className="ytc-schematic__node ytc-schematic__node--client"
            />
            <text x="130" y="36" textAnchor="middle" className="ytc-schematic__title">
              Browser
            </text>
            <text x="130" y="58" textAnchor="middle" className="ytc-schematic__sub">
              /upload · progress UI
            </text>
            <text x="130" y="82" textAnchor="middle" className="ytc-schematic__hint">
              01 session · 03 complete
            </text>
            <text x="130" y="98" textAnchor="middle" className="ytc-schematic__sub">
              02 happens on the dashed path
            </text>
          </g>

          {/* API */}
          <g className="ytc-schematic__block" style={{ ['--ytc-enter-delay' as string]: '0.12s' }} transform="translate(410, 58)">
            <rect
              width="240"
              height="110"
              rx="2"
              className="ytc-schematic__node ytc-schematic__node--api"
            />
            <text x="120" y="34" textAnchor="middle" className="ytc-schematic__title">
              API
            </text>
            <text x="120" y="56" textAnchor="middle" className="ytc-schematic__sub">
              mint pre-signed URL · validate
            </text>
            <text x="120" y="78" textAnchor="middle" className="ytc-schematic__hint">
              no video bytes through here
            </text>
            <text x="120" y="96" textAnchor="middle" className="ytc-schematic__sub">
              then enqueue transcode job
            </text>
          </g>

          {/* Postgres */}
          <g className="ytc-schematic__block" style={{ ['--ytc-enter-delay' as string]: '0.2s' }} transform="translate(450, 238)">
            <rect width="160" height="96" rx="2" className="ytc-schematic__node" />
            <text x="80" y="34" textAnchor="middle" className="ytc-schematic__title">
              Postgres
            </text>
            <text x="80" y="56" textAnchor="middle" className="ytc-schematic__sub">
              video row · status
            </text>
            <text x="80" y="76" textAnchor="middle" className="ytc-schematic__sub">
              Uploading → Ready
            </text>
          </g>

          {/* S3 */}
          <g className="ytc-schematic__block" style={{ ['--ytc-enter-delay' as string]: '0.28s' }} transform="translate(290, 420)">
            <rect
              width="210"
              height="100"
              rx="2"
              className="ytc-schematic__node ytc-schematic__node--storage"
            />
            <text x="105" y="34" textAnchor="middle" className="ytc-schematic__title">
              Amazon S3
            </text>
            <text x="105" y="56" textAnchor="middle" className="ytc-schematic__sub">
              02 original object
            </text>
            <text x="105" y="76" textAnchor="middle" className="ytc-schematic__sub">
              05 LQ · HQ · thumbnail
            </text>
          </g>

          {/* SQS queue: vertical FIFO pipe */}
          <g className="ytc-schematic__block" style={{ ['--ytc-enter-delay' as string]: '0.18s' }} transform="translate(718, 40)">
            <rect
              width="210"
              height="320"
              rx="2"
              className="ytc-schematic__node ytc-schematic__node--queue"
            />
            <text x="105" y="32" textAnchor="middle" className="ytc-schematic__title">
              SQS queue
            </text>

            {QUEUE_JOBS.map((job, index) => {
              const y = 52 + index * 58
              const showChevron = index < QUEUE_JOBS.length - 1
              return (
                <g key={job.id}>
                  <g transform={`translate(28, ${y})`}>
                    <rect
                      width="154"
                      height="42"
                      rx="2"
                      className={
                        job.hot
                          ? 'ytc-schematic__ticket ytc-schematic__ticket--hot'
                          : 'ytc-schematic__ticket'
                      }
                    />
                    <text
                      x="12"
                      y="26"
                      className={
                        job.hot
                          ? 'ytc-schematic__ticket-text ytc-schematic__ticket-text--hot'
                          : 'ytc-schematic__ticket-text'
                      }
                    >
                      {job.id}
                    </text>
                    <text
                      x="142"
                      y="26"
                      textAnchor="end"
                      className={
                        job.hot
                          ? 'ytc-schematic__ticket-role ytc-schematic__ticket-role--hot'
                          : 'ytc-schematic__ticket-role'
                      }
                    >
                      {job.role}
                    </text>
                  </g>
                  {showChevron && (
                    <path
                      d={`M105 ${y + 46} l-5 6 l10 0 z`}
                      className="ytc-schematic__chevron"
                    />
                  )}
                </g>
              )
            })}
          </g>

          {/* Worker */}
          <g className="ytc-schematic__block" style={{ ['--ytc-enter-delay' as string]: '0.36s' }} transform="translate(640, 420)">
            <rect
              width="200"
              height="100"
              rx="2"
              className="ytc-schematic__node ytc-schematic__node--worker"
            />
            <text x="100" y="34" textAnchor="middle" className="ytc-schematic__title">
              Worker
            </text>
            <text x="100" y="56" textAnchor="middle" className="ytc-schematic__sub">
              FFmpeg · LQ / HQ / thumb
            </text>
            <text x="100" y="78" textAnchor="middle" className="ytc-schematic__hint">
              write S3 · mark Ready
            </text>
          </g>

          <g className="ytc-schematic__labels">
            <text x="540" y="210" textAnchor="middle" className="ytc-schematic__edge">
              insert row
            </text>
            <text x="635" y="548" textAnchor="middle" className="ytc-schematic__edge">
              status → Ready
            </text>
          </g>
        </svg>
      </div>

      <motion.figcaption
        className="ytc-schematic__caption"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.45, delay: 0.55, ease: easeOut }}
      >
        <span>
          <i className="ytc-schematic__swatch ytc-schematic__swatch--solid" aria-hidden="true" />
          Solid: API control messages
        </span>
        <span>
          <i className="ytc-schematic__swatch ytc-schematic__swatch--dash" aria-hidden="true" />
          Dashed: video bytes (browser → S3 only)
        </span>
        <span>
          <i className="ytc-schematic__swatch ytc-schematic__swatch--hot" aria-hidden="true" />
          Tracer follows one upload (vid_a3f) end-to-end
        </span>
      </motion.figcaption>
    </figure>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import './YouTubeTestRun.css'

const SUITES = [
  {
    id: 'unit',
    label: 'Unit',
    count: 50,
    items: [
      'Video create/validation and status transitions',
      'Soft-delete / abandoned upload rules',
      'FFmpeg argument builder (no upscale, correct object keys)',
      'Transcode handler success and failure-after-retries',
      'Auth registration/login edge cases',
      'Password hashing',
      'Visibility matrix (VideoAccessPolicy)',
      'S3 pre-sign URL shape for browser-safe hosts',
    ],
  },
  {
    id: 'integration',
    label: 'Integration',
    count: 27,
    items: [
      'Health / readiness',
      'Auth register/login/me, concurrent register',
      'Full upload lifecycle (create → PUT → complete → enqueue)',
      'Abandon mid-upload / complete after refresh',
      'Ownership enforcement (other user → 404)',
      'Idempotent complete/delete',
      'Storage cleanup on soft-delete',
      'Browse: public feed, search, channel, private/unlisted rules',
    ],
  },
  {
    id: 'e2e',
    label: 'Playwright E2E',
    count: 3,
    items: [
      'Create account from the real login UI',
      'Upload through the real upload page',
      'Change visibility and delete from the library three-dots menu',
    ],
  },
] as const

const TOTAL_TESTS = SUITES.reduce((sum, suite) => sum + suite.count, 0)
const TARGET_COVERAGE = 72
const FLAT_ITEMS = SUITES.flatMap((suite) =>
  suite.items.map((label) => ({ suite: suite.id, label })),
)

const RING_SIZE = 120
const RING_STROKE = 6
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

interface YouTubeTestRunProps {
  reduceMotion: boolean | null
}

export function YouTubeTestRun({ reduceMotion }: YouTubeTestRunProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: true, margin: '-12%' })
  const skipMotion = !!reduceMotion

  const [revealed, setRevealed] = useState(skipMotion ? FLAT_ITEMS.length : 0)
  const [testsPassed, setTestsPassed] = useState(skipMotion ? TOTAL_TESTS : 0)
  const [coverage, setCoverage] = useState(skipMotion ? TARGET_COVERAGE : 0)
  const [running, setRunning] = useState(!skipMotion)

  useEffect(() => {
    if (!inView || skipMotion) return

    let index = 0
    setRunning(true)

    const tick = window.setInterval(() => {
      index += 1
      const progress = index / FLAT_ITEMS.length
      setRevealed(index)
      setTestsPassed(Math.round(progress * TOTAL_TESTS))
      setCoverage(Math.round(progress * TARGET_COVERAGE))

      if (index >= FLAT_ITEMS.length) {
        window.clearInterval(tick)
        setTestsPassed(TOTAL_TESTS)
        setCoverage(TARGET_COVERAGE)
        setRunning(false)
      }
    }, 140)

    return () => window.clearInterval(tick)
  }, [inView, skipMotion])

  const passRate = skipMotion
    ? 100
    : Math.min(100, (revealed / FLAT_ITEMS.length) * 100)
  const dashOffset = RING_CIRCUMFERENCE * (1 - passRate / 100)

  let cursor = 0

  return (
    <div ref={rootRef} className="ytc-run">
      <div className="ytc-run__hud">
        <div
          className="ytc-run__ring-wrap"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(passRate)}
          aria-label="Test cases passed"
        >
          <svg
            className="ytc-run__ring"
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            aria-hidden="true"
          >
            <circle
              className="ytc-run__ring-track"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
            />
            <circle
              className="ytc-run__ring-progress"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </svg>
          <div className="ytc-run__ring-center">
            <span className="ytc-run__ring-value">{Math.round(passRate)}%</span>
          </div>
        </div>

        <div className="ytc-run__meta" aria-live="polite">
          {running && (
            <p className="ytc-run__status">
              <span className="ytc-run__pulse ytc-run__pulse--live" />
              Running suite…
            </p>
          )}
          <p className="ytc-run__summary">
            <span>
              {testsPassed}/{TOTAL_TESTS} tests
            </span>
            <span className="ytc-run__summary-sep" aria-hidden="true">
              ·
            </span>
            <span>{coverage}% coverage</span>
          </p>
        </div>
      </div>

      <div className="ytc-run__suites">
        {SUITES.map((suite) => {
          const suiteStart = cursor
          cursor += suite.items.length

          return (
            <div key={suite.id} className="ytc-run__suite">
              <div className="ytc-run__suite-head">
                <h3 className="ytc-run__suite-title">{suite.label}</h3>
                <span className="ytc-run__suite-count">~{suite.count} tests</span>
              </div>
              <ul className="ytc-run__list">
                {suite.items.map((label, itemIndex) => {
                  const flatIndex = suiteStart + itemIndex
                  const passed = revealed > flatIndex
                  const active = revealed === flatIndex && running

                  return (
                    <li
                      key={label}
                      className={[
                        'ytc-run__item',
                        passed ? 'ytc-run__item--pass' : '',
                        active ? 'ytc-run__item--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="ytc-run__mark" aria-hidden="true">
                        {passed ? '✓' : active ? '›' : '·'}
                      </span>
                      <span className="ytc-run__name">{label}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      <p className="ytc-run__note">
        Coverlet (unit + integration union) lands around 70%+ overall, with strong coverage on
        API, Application, and Domain. CI emphasizes unit tests + web typecheck/lint; integration
        and Playwright stay local/Docker-backed by design.
      </p>
    </div>
  )
}

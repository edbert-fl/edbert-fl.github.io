import { lazy, Suspense, useEffect, type FocusEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { GlitchText } from '../components/Hero/GlitchText'
import { ProjectPageShell } from '../components/Project/ProjectPageShell'
import { YouTubeArchitectureDiagram } from './YouTubeArchitectureDiagram'
import { YouTubeScaleFaq } from './YouTubeScaleFaq'
import { YouTubeTestRun } from './YouTubeTestRun'
import './YouTubeClonePage.css'

function scrollSectionIntoView(event: FocusEvent<HTMLElement>) {
  event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const YouTubeHoloCanvas = lazy(() =>
  import('./YouTubeHoloCanvas').then((mod) => ({ default: mod.YouTubeHoloCanvas })),
)

const easeOut = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: easeOut },
  }),
}

const GOALS = [
  'Keep large media out of the API via direct-to-storage uploads',
  'Process video asynchronously so upload stays fast',
  'Separate metadata (Postgres) from bytes (object storage)',
  'Enforce visibility correctly across feed, watch, and channel views',
  'Ship with a serious test pyramid (unit → integration → Playwright E2E)',
]

const PRINCIPLES = [
  {
    label: 'API owns metadata',
    body: 'Orchestration only. Never streams large uploads through itself.',
  },
  {
    label: 'Direct S3 upload',
    body: 'Browser PUTs via time-limited pre-signed URLs.',
  },
  {
    label: 'Async via SQS',
    body: 'Complete upload returns quickly; the worker does CPU-heavy work.',
  },
  {
    label: 'Domain status machine',
    body: 'Illegal transitions blocked (e.g. Ready without Processing).',
  },
  {
    label: 'Visibility policy',
    body: 'Centralized who can see what: owner vs anonymous vs public feed.',
  },
  {
    label: 'Soft delete',
    body: 'Hidden from lists/feeds; associated S3 objects removed.',
  },
]

const CAPABILITIES = [
  'Register / sign in / sign out',
  'Create upload session → PUT to S3 → complete → enqueue transcode',
  'Worker produces LQ, HQ, and a thumbnail',
  'Watch page with quality switch (Low/High), processing/failed states',
  'Public home feed + title search',
  'Channel page by slug',
  'Library (“My videos”) with owner controls',
  'Upload visibility: Public / Unlisted / Private',
  'Three-dots card menu: change visibility + delete',
  'Upload size validation (100 MB cap) and content-type checks',
]

const VISIBILITY_ROWS = [
  {
    state: 'Public + Ready',
    feed: 'Listed',
    watch: 'Anyone',
    channel: 'Listed',
    owner: 'Full',
  },
  {
    state: 'Unlisted + Ready',
    feed: 'Hidden',
    watch: 'Link only',
    channel: 'Hidden',
    owner: 'Full',
  },
  {
    state: 'Private',
    feed: 'Hidden',
    watch: 'Owner only',
    channel: 'Hidden',
    owner: 'Full',
  },
  {
    state: 'Non-ready',
    feed: 'Hidden',
    watch: 'Owner only',
    channel: 'Hidden',
    owner: 'Full',
  },
  {
    state: 'Soft-deleted',
    feed: '404',
    watch: '404',
    channel: '404',
    owner: '404',
  },
]

const LAYERS = [
  { name: 'YouTubeClone.Domain', role: 'Entities, enums, invariants (Video status machine)' },
  { name: 'YouTubeClone.Application', role: 'Services, DTOs, access policy, abstractions' },
  { name: 'YouTubeClone.Infrastructure', role: 'EF Core, S3, SQS, FFmpeg adapters' },
  { name: 'YouTubeClone.Api', role: 'HTTP endpoints, JWT auth, exception handling' },
  { name: 'YouTubeClone.Worker', role: 'SQS consumer + transcode pipeline' },
]

const STACK = [
  { layer: 'Frontend', tech: 'Next.js 15 (App Router), React 19, TypeScript, CSS modules' },
  { layer: 'API', tech: 'ASP.NET Core (.NET 8), minimal APIs, JWT auth, OpenAPI/Swagger' },
  { layer: 'Worker', tech: '.NET 8 background service + FFmpeg (LQ/HQ + thumbnail)' },
  { layer: 'Domain', tech: 'Rich entities, status machine (Uploading → Uploaded → Processing → Ready / Failed)' },
  { layer: 'Data', tech: 'PostgreSQL + EF Core (migrations, repositories)' },
  { layer: 'Object storage', tech: 'Amazon S3 (pre-signed PUT/GET, soft-delete cleanup)' },
  { layer: 'Job queue', tech: 'Amazon SQS (transcode jobs + failure/retry handling)' },
  { layer: 'Auth', tech: 'Password registration/login issuing JWTs; Cognito-style sub claims' },
  { layer: 'Local', tech: 'Docker Compose (API, worker, web, Postgres, supporting services)' },
  { layer: 'E2E', tech: 'Playwright (Chromium)' },
]

const TALKING_POINTS = [
  'End-to-end product thinking, not just a CRUD demo',
  'Cloud-native patterns: S3 direct upload, SQS async jobs, Postgres metadata, JWT auth',
  'Separation of concerns with Clean Architecture',
  'Scale from day one: API, workers, and storage can grow on separate axes',
  'Correctness under edge cases (abandon upload, retries, visibility, ownership)',
  'Automated testing discipline across unit, integration, and browser E2E',
]

export function YouTubeClonePage() {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const previous = document.title
    document.title = 'YouTube Clone | Edbert Felix Lim'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <ProjectPageShell ariaLabel="YouTube Clone case study">
      <header className="ytc-hero" aria-labelledby="ytc-hero-title">
        <motion.div
          className="ytc-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>Side Project</span>
          <GlitchText
            text="YouTube Clone"
            as="h1"
            id="ytc-hero-title"
            className="ytc-title"
          />
          <p className="ytc-headline">
            Direct-to-S3 upload, async transcode, and visibility that holds up.
          </p>
          <div className="ytc-cta">
            <a
              href="https://github.com/edbert-fl/youtube-clone"
              className="ytc-cta__primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <Link to="/#work" className="ytc-cta__ghost">
              Back to work
            </Link>
          </div>
        </motion.div>

        {!reduceMotion && (
          <motion.div
            className="ytc-hero__holo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.08, ease: easeOut }}
          >
            <Suspense fallback={null}>
              <YouTubeHoloCanvas />
            </Suspense>
          </motion.div>
        )}
      </header>

      <motion.section
        className="ytc-block ytc-goals"
        aria-labelledby="ytc-goals-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>01 / Intent</span>
        <h2 id="ytc-goals-title" className="ytc-block__title">
          Problem & goals
        </h2>
        <p className="ytc-block__lede">
          Most “YouTube clone” demos stop at uploading a file into a database blob. This project
          focuses on real platform patterns.
        </p>
        <ol className="ytc-goals__list">
          {GOALS.map((goal, index) => (
            <li key={goal}>
              <span className="ytc-goals__num">{String(index + 1).padStart(2, '0')}</span>
              <span>{goal}</span>
            </li>
          ))}
        </ol>
      </motion.section>

      <motion.section
        className="ytc-block ytc-arch"
        aria-labelledby="ytc-arch-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0.05}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>02 / Architecture</span>
        <h2 id="ytc-arch-title" className="ytc-block__title">
          Upload path
        </h2>
        <p className="ytc-block__lede">
          One video’s journey: request a session, put the file straight to S3, complete the
          upload so a job lands on the queue, then let the worker drain that queue into LQ/HQ
          renditions and a Ready status.
        </p>

        <YouTubeArchitectureDiagram />

        <h3 className="ytc-subhead">Design principles</h3>
        <ul className="ytc-principles">
          {PRINCIPLES.map((item) => (
            <li key={item.label}>
              <span className="ytc-principles__label">{item.label}</span>
              <span className="ytc-principles__body">{item.body}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        className="ytc-block ytc-caps"
        aria-labelledby="ytc-caps-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0.05}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>03 / Product</span>
        <h2 id="ytc-caps-title" className="ytc-block__title">
          Core capabilities
        </h2>
        <ul className="ytc-caps__list">
          {CAPABILITIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        className="ytc-block ytc-vis"
        aria-labelledby="ytc-vis-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0.05}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>04 / Security</span>
        <h2 id="ytc-vis-title" className="ytc-block__title">
          Visibility rules
        </h2>
        <p className="ytc-block__lede">
          Product rules and access control share one policy: who can see what across feed,
          watch, and channel.
        </p>

        <div className="ytc-matrix-wrap">
          <table className="ytc-matrix">
            <caption className="sr-only">
              Visibility rules by video state across feed, watch, channel, and owner access
            </caption>
            <thead>
              <tr>
                <th scope="col">State</th>
                <th scope="col">Feed</th>
                <th scope="col">Watch</th>
                <th scope="col">Channel</th>
                <th scope="col">Owner</th>
              </tr>
            </thead>
            <tbody>
              {VISIBILITY_ROWS.map((row) => (
                <tr key={row.state}>
                  <th scope="row">{row.state}</th>
                  <td>{row.feed}</td>
                  <td>{row.watch}</td>
                  <td>{row.channel}</td>
                  <td>{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section
        className="ytc-block ytc-stack"
        aria-labelledby="ytc-stack-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0.05}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>05 / Stack</span>
        <h2 id="ytc-stack-title" className="ytc-block__title">
          Tech & structure
        </h2>

        <div className="ytc-stack__table-wrap">
          <table className="ytc-stack__table">
            <caption className="sr-only">Technology stack by layer</caption>
            <tbody>
              {STACK.map((row) => (
                <tr key={row.layer}>
                  <th scope="row">{row.layer}</th>
                  <td>{row.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="ytc-subhead">Backend layers</h3>
        <ol className="ytc-layers">
          {LAYERS.map((layer) => (
            <li key={layer.name}>
              <code>{layer.name}</code>
              <span>{layer.role}</span>
            </li>
          ))}
        </ol>
      </motion.section>

      <motion.section
        className="ytc-block ytc-test"
        aria-labelledby="ytc-test-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0.05}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>06 / Quality</span>
        <h2 id="ytc-test-title" className="ytc-block__title">
          Testing strategy
        </h2>
        <p className="ytc-block__lede">
          Built as a deliberate pyramid, not just smoke checks. Watch the suite fill in as
          coverage climbs toward the Coverlet union result.
        </p>

        <YouTubeTestRun reduceMotion={reduceMotion} />
      </motion.section>

      <motion.section
        className="ytc-block ytc-scale"
        aria-labelledby="ytc-scale-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0.05}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>
          07 / Scale
        </span>
        <h2 id="ytc-scale-title" className="ytc-block__title">
          Future scalability
        </h2>
        <p className="ytc-block__lede">
          Upload, processing, and read paths are meant to grow on different axes. This is the
          shape I would take the system next.
        </p>

        <YouTubeScaleFaq />
      </motion.section>

      <motion.section
        className="ytc-block ytc-points"
        aria-labelledby="ytc-points-title"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-12%' }}
        custom={0.05}
        variants={fadeUp}
      >
        <span className="ytc-index" tabIndex={0} onFocus={scrollSectionIntoView}>
          08 / Takeaways
        </span>
        <h2 id="ytc-points-title" className="ytc-block__title">
          What this demonstrates
        </h2>
        <ul className="ytc-points__list">
          {TALKING_POINTS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </motion.section>

      <footer className="ytc-footer" aria-label="Case study actions">
        <a
          href="https://github.com/edbert-fl/youtube-clone"
          className="ytc-cta__primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
          <span className="sr-only"> (opens in new tab)</span>
        </a>
        <Link to="/#work" className="ytc-cta__ghost">
          Back to selected work
        </Link>
        <Link to="/#contact" className="ytc-cta__ghost">
          Get in touch
        </Link>
      </footer>
    </ProjectPageShell>
  )
}

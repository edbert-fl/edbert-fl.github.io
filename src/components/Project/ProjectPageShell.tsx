import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import './ProjectPageShell.css'

interface ProjectPageShellProps {
  children: ReactNode
  backTo?: string
  backLabel?: string
  /** Accessible name for the main landmark */
  ariaLabel?: string
}

export function ProjectPageShell({
  children,
  backTo = '/#work',
  backLabel = 'Back to work',
  ariaLabel = 'Project case study',
}: ProjectPageShellProps) {
  return (
    <main id="main-content" className="project-page" tabIndex={-1} aria-label={ariaLabel}>
      <div className="project-page__bg" aria-hidden="true">
        <div className="project-page__grid" />
        <div className="project-page__scanlines" />
      </div>

      <div className="project-page__inner">
        <Link to={backTo} className="project-page__back">
          ← {backLabel}
        </Link>
        {children}
      </div>
    </main>
  )
}

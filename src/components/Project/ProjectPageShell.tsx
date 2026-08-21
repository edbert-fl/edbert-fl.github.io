import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import './ProjectPageShell.css'

interface ProjectPageShellProps {
  children: ReactNode
  backTo?: string
  backLabel?: string
}

export function ProjectPageShell({
  children,
  backTo = '/#work',
  backLabel = 'Back to work',
}: ProjectPageShellProps) {
  return (
    <main id="main-content" className="project-page">
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

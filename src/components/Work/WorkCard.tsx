import type { WorkProject } from '../../data/work'

interface WorkCardProps {
  project: WorkProject
  index: number
  focus: number
  onFocus?: () => void
  onBlur?: () => void
}

export function WorkCard({ project, index, focus, onFocus, onBlur }: WorkCardProps) {
  const active = focus > 0.45
  const opacity = 0.28 + focus * 0.72
  const titleId = `work-card-title-${project.id}`

  return (
    <article
      className={`work-card${active ? ' work-card--active' : ''}`}
      data-index={index}
      style={{ opacity }}
      tabIndex={0}
      aria-labelledby={titleId}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="work-card__inner">
        <div className="work-card__meta">
          <span className="work-card__index">{String(index + 1).padStart(2, '0')}</span>
          <span className="work-card__category">{project.category}</span>
        </div>

        {project.awards && project.awards.length > 0 && (
          <ul className="work-card__awards" aria-label="Awards">
            {project.awards.map((award) => (
              <li key={award}>
                <span className="work-card__award-badge">{award}</span>
              </li>
            ))}
          </ul>
        )}

        {!project.awards?.length && project.badge && (
          <span className="work-card__badge">{project.badge}</span>
        )}
        {project.award && <span className="work-card__award">{project.award}</span>}

        <h3 id={titleId} className="work-card__title">{project.title}</h3>
        <p className="work-card__description">{project.description}</p>

        <ul className="work-card__tech">
          {project.tech.map((item) => (
            <li key={item} className="work-card__tech-item">
              {item}
            </li>
          ))}
        </ul>

        {project.links && project.links.length > 0 && (
          <ul className="work-card__links">
            {project.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-card__link"
                >
                  {link.label}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

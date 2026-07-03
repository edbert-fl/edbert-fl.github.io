import { forwardRef } from 'react'
import type { ExperienceRole } from '../../data/experience'

interface ExperienceCardProps {
  role: ExperienceRole
  index: number
  focus: number
  onFocus?: () => void
  onBlur?: () => void
}

export const ExperienceCard = forwardRef<HTMLElement, ExperienceCardProps>(
  function ExperienceCard({ role, index, focus, onFocus, onBlur }, ref) {
    const scheduleLabel = role.schedule ? ` (${role.schedule})` : ''
    const active = focus > 0.45
    const opacity = 0.32 + focus * 0.68
    const titleId = `experience-card-title-${role.id}`

    return (
      <article
        ref={ref}
        className={`experience-card${active ? ' experience-card--active' : ''}`}
        data-index={index}
        style={{ opacity }}
        tabIndex={0}
        aria-labelledby={titleId}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div className="experience-card__rail">
          <span className="experience-card__index">{String(index + 1).padStart(2, '0')}</span>
          <span className="experience-card__period">{role.period}</span>
        </div>

        <div className="experience-card__body">
          <div className="experience-card__brand">
            <img
              src={role.logo}
              alt={role.company}
              className={`experience-card__logo experience-card__logo--${role.id}`}
              loading="lazy"
              decoding="async"
            />
          </div>
          <h3 id={titleId} className="experience-card__title">
            {role.title}
            {scheduleLabel && (
              <span className="experience-card__schedule">{scheduleLabel}</span>
            )}
          </h3>
          <ul className="experience-card__highlights">
            {role.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>

          {role.sites && role.sites.length > 0 && (
            <ul className="experience-card__sites">
              {role.sites.map((site) => (
                <li key={site.url}>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="experience-card__site-link"
                  >
                    {site.label}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    )
  },
)

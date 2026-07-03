interface BrandIconProps {
  className?: string
}

const STROKE = 1

export function MailOutlineIcon({ className }: BrandIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path
        d="M3 7.5 12 13.25 21 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LinkedInOutlineIcon({ className }: BrandIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <circle cx="7.5" cy="8" r="1.75" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <line
        x1="7.5"
        y1="11"
        x2="7.5"
        y2="17"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d="M11 11v6M11 13.2c0-1.65 1.05-2.7 2.55-2.7 1.55 0 2.45 1.05 2.45 2.7V17"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GitHubOutlineIcon({ className }: BrandIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.071 1.531 1.031 1.531 1.031.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </svg>
  )
}

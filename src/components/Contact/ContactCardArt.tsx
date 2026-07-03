import type { ContactChannel } from '../../data/contact'
import { GitHubOutlineIcon, LinkedInOutlineIcon, MailOutlineIcon } from './ContactBrandIcons'
import './ContactCardArt.css'

interface ContactCardArtProps {
  channel: ContactChannel
  active: boolean
}

const ICONS = {
  email: MailOutlineIcon,
  linkedin: LinkedInOutlineIcon,
  github: GitHubOutlineIcon,
} as const

export function ContactCardArt({ channel, active }: ContactCardArtProps) {
  const Icon = ICONS[channel]

  return (
    <div className={`contact-card-art contact-card-art--${channel}${active ? ' contact-card-art--active' : ''}`}>
      <Icon className="contact-card-art__brand" />
    </div>
  )
}

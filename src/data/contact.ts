export type ContactChannel = 'email' | 'linkedin' | 'github'

export interface ContactLink {
  id: ContactChannel
  label: string
  href: string
  display: string
}

export const CONTACT_LINKS: ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:edbert.fl@gmail.com',
    display: 'edbert.fl@gmail.com',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/edbert-fl',
    display: 'linkedin.com/in/edbert-fl',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/edbert-fl',
    display: 'github.com/edbert-fl',
  },
]

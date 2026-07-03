import type { ExperienceNodeVariant } from '../../../../data/experience'
import { AscendNodeArt } from './AscendNodeArt'
import { NetpoleonNodeArt } from './NetpoleonNodeArt'
import type { NodeArtworkProps } from './pipelineTheme'
import { TronNodeArt } from './TronNodeArt'
import { UsydNodeArt } from './UsydNodeArt'
import { WhatsOnNodeArt } from './WhatsOnNodeArt'

export function ExperienceNodeArt({
  variant,
  ...props
}: NodeArtworkProps & { variant: ExperienceNodeVariant }) {
  switch (variant) {
    case 'enterprise':
      return <AscendNodeArt {...props} />
    case 'analytics':
      return <WhatsOnNodeArt {...props} />
    case 'web':
      return <NetpoleonNodeArt {...props} />
    case 'research':
      return <UsydNodeArt {...props} />
    case 'education':
      return <TronNodeArt {...props} />
  }
}

import { DOC_LINKS } from '../lib/docs'

type LinkItem = {
  label: string
  href: string
}

function siteDoc(path: string) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return `https://solana-nft-mint-machine.vercel.app${path}`
}

const DEFAULT_LINKS: LinkItem[] = [
  { label: 'Owner manual', href: DOC_LINKS.ownerManual },
  { label: 'Fees & costs', href: DOC_LINKS.feesAndCosts },
  { label: 'Manual (download)', href: siteDoc('/docs/OWNER-MANUAL.md') },
  { label: 'Fees (download)', href: siteDoc('/docs/FEES-AND-COSTS.md') },
  { label: 'GitHub', href: DOC_LINKS.repo },
]

type Props = {
  links?: LinkItem[]
  className?: string
  size?: 'sm' | 'md'
}

export function DocLinks({ links = DEFAULT_LINKS, className = '', size = 'sm' }: Props) {
  const textClass = size === 'md' ? 'text-sm' : 'text-xs'

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-x-1 gap-y-1 ${textClass} ${className}`}
      aria-label="Documentation links"
    >
      {links.map((item, i) => (
        <span key={item.href} className="inline-flex items-center">
          {i > 0 && <span className="mx-2 text-zinc-600" aria-hidden>|</span>}
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-2 transition hover:text-cyan-300 hover:decoration-cyan-300"
          >
            {item.label}
          </a>
        </span>
      ))}
    </nav>
  )
}

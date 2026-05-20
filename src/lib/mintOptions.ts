import type { MintType } from './mint/types'

export type MintOption = {
  id: MintType
  emoji: string
  title: string
  tagline: string
  costLine: string
  bestFor: string
  badge?: string
}

export const MINT_OPTIONS: MintOption[] = [
  {
    id: 'cnft',
    emoji: '📦',
    title: 'Compressed',
    tagline: 'Cheapest when minting many',
    costLine: '~$5–15 one-time setup, then ~1¢ each',
    bestFor: '20+ copies, same image, bulk drops',
    badge: 'Best for your 20',
  },
  {
    id: 'core',
    emoji: '⚡',
    title: 'Core',
    tagline: 'Modern standard, lower cost',
    costLine: '~$0.30–0.50 each',
    bestFor: '1–20 NFTs, works in most wallets',
    badge: 'Recommended',
  },
  {
    id: 'classic',
    emoji: '💎',
    title: 'Classic',
    tagline: 'Original Metaplex NFT',
    costLine: '~$2+ each',
    bestFor: 'Maximum old-school compatibility',
  },
]

export function getMintOption(id: MintType): MintOption {
  return MINT_OPTIONS.find((o) => o.id === id) ?? MINT_OPTIONS[0]
}

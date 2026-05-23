export const DOC_LINKS = {
  liveApp: 'https://solana-nft-mint-machine.vercel.app',
  ownerManual:
    'https://github.com/Morgen33/solana-nft-mint-machine/blob/main/OWNER-MANUAL.md',
  feesAndCosts:
    'https://github.com/Morgen33/solana-nft-mint-machine/blob/main/FEES-AND-COSTS.md',
  readme: 'https://github.com/Morgen33/solana-nft-mint-machine/blob/main/README.md',
  repo: 'https://github.com/Morgen33/solana-nft-mint-machine',
  explorer: 'https://explorer.solana.com',
  magicEdenCreatorHub: 'https://creators.magiceden.io',
  magicEdenListingGuide:
    'https://help.magiceden.io/en/articles/6006558-how-to-list-your-nft-collection-on-magic-eden-using-creator-hub',
} as const

export type DocLinkKey = keyof typeof DOC_LINKS

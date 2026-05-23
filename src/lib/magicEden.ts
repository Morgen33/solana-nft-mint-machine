/** Magic Eden listing is separate from minting — Creator Hub is the official path. */
export const MAGIC_EDEN_LINKS = {
  creatorHub: 'https://creators.magiceden.io',
  creatorHubUs: 'https://creators.magiceden.us',
  listCollectionGuide:
    'https://help.magiceden.io/en/articles/6006558-how-to-list-your-nft-collection-on-magic-eden-using-creator-hub',
  hashListGuide:
    'https://help.magiceden.io/en/articles/5962181-how-to-generate-and-manage-a-hash-list-for-solana-nfts-on-magic-eden',
  marketplace: 'https://magiceden.io/marketplace',
} as const

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Normalize Irys gateway URLs to arweave.net permalinks. */
export function toArweaveUri(uri: string): string {
  const trimmed = uri.trim()
  if (trimmed.includes('arweave.net/')) return trimmed

  const gatewayMatch = trimmed.match(
    /gateway\.irys\.xyz\/([a-zA-Z0-9_-]+)/,
  )
  if (gatewayMatch?.[1]) {
    return `https://arweave.net/${gatewayMatch[1]}`
  }

  const pathMatch = trimmed.match(/\/([a-zA-Z0-9_-]{20,})$/)
  if (pathMatch?.[1] && !trimmed.includes('arweave.net')) {
    return `https://arweave.net/${pathMatch[1]}`
  }

  return trimmed
}

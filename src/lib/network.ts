export type SolanaCluster = 'devnet' | 'mainnet-beta'

export const CLUSTER_ENDPOINTS: Record<SolanaCluster, string> = {
  devnet:
    import.meta.env.VITE_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
  'mainnet-beta':
    import.meta.env.VITE_SOLANA_MAINNET_RPC_URL ??
    'https://api.mainnet-beta.solana.com',
}

export function explorerTxUrl(signature: string, cluster: SolanaCluster): string {
  const base = `https://explorer.solana.com/tx/${signature}`
  return cluster === 'mainnet-beta' ? base : `${base}?cluster=devnet`
}

export function explorerAddressUrl(address: string, cluster: SolanaCluster): string {
  const base = `https://explorer.solana.com/address/${address}`
  return cluster === 'mainnet-beta' ? base : `${base}?cluster=devnet`
}

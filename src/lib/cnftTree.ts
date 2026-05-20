import type { SolanaCluster } from './network'

function storageKey(cluster: SolanaCluster, wallet: string) {
  return `cnft-tree:${cluster}:${wallet}`
}

export function loadTreeAddress(
  cluster: SolanaCluster,
  wallet: string,
): string | null {
  try {
    return localStorage.getItem(storageKey(cluster, wallet))
  } catch {
    return null
  }
}

export function saveTreeAddress(
  cluster: SolanaCluster,
  wallet: string,
  treeAddress: string,
) {
  localStorage.setItem(storageKey(cluster, wallet), treeAddress)
}

export function clearTreeAddress(cluster: SolanaCluster, wallet: string) {
  localStorage.removeItem(storageKey(cluster, wallet))
}

/** Tree holds 2^6 = 64 compressed NFTs — enough for batches up to 20 with room to grow. */
export const CNFT_TREE_CAPACITY = 64
export const CNFT_TREE_MAX_DEPTH = 6

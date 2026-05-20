import type { WalletAdapter } from '@solana/wallet-adapter-base'
import type { SolanaCluster } from '../network'
import { mintClassicNft, simulateClassicMint } from './classic'
import { createCnftTree, mintCnft, simulateCnftMint } from './cnft'
import { mintCoreNft, simulateCoreMint } from './core'
import type { MintParams, MintResult, MintType, SimulationResult } from './types'

export type { CreateTreeResult } from './cnft'
export type { MintParams, MintResult, MintType, SimulationResult }
export { createCnftTree }

export async function simulateMint(
  mintType: MintType,
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
  treeAddress?: string,
): Promise<SimulationResult> {
  switch (mintType) {
    case 'classic':
      return simulateClassicMint(wallet, cluster, params)
    case 'core':
      return simulateCoreMint(wallet, cluster, params)
    case 'cnft':
      if (!treeAddress) {
        return { success: false, error: 'Create your storage tree first.' }
      }
      return simulateCnftMint(wallet, cluster, treeAddress, params)
  }
}

export async function mintSingle(
  mintType: MintType,
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
  treeAddress?: string,
): Promise<MintResult> {
  switch (mintType) {
    case 'classic':
      return mintClassicNft(wallet, cluster, params)
    case 'core':
      return mintCoreNft(wallet, cluster, params)
    case 'cnft':
      if (!treeAddress) {
        throw new Error('Create your storage tree first.')
      }
      return mintCnft(wallet, cluster, treeAddress, params)
  }
}

export async function mintBatch(
  mintType: MintType,
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
  quantity: number,
  treeAddress?: string,
  onProgress?: (current: number, total: number, result: MintResult) => void,
): Promise<MintResult[]> {
  const results: MintResult[] = []

  for (let i = 0; i < quantity; i++) {
    const suffix = quantity > 1 ? ` #${i + 1}` : ''
    const result = await mintSingle(mintType, wallet, cluster, {
      ...params,
      name: `${params.name}${suffix}`,
    }, treeAddress)
    results.push(result)
    onProgress?.(i + 1, quantity, result)
  }

  return results
}

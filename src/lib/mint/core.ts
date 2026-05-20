import { create } from '@metaplex-foundation/mpl-core'
import { generateSigner } from '@metaplex-foundation/umi'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import type { SolanaCluster } from '../network'
import type { MintParams, MintResult, SimulationResult } from './types'
import { createUmiForWallet } from './umi'

export async function simulateCoreMint(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
): Promise<SimulationResult> {
  const umi = createUmiForWallet(wallet, cluster, 'core')
  const asset = generateSigner(umi)

  try {
    const transaction = await create(umi, {
      asset,
      name: params.name,
      uri: params.uri,
    }).buildAndSign(umi)

    const simulation = await umi.rpc.simulateTransaction(transaction, {
      commitment: 'confirmed',
    })

    if (simulation.err) {
      return { success: false, error: JSON.stringify(simulation.err) }
    }

    return { success: true, unitsConsumed: simulation.unitsConsumed ?? undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function mintCoreNft(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
): Promise<MintResult> {
  const umi = createUmiForWallet(wallet, cluster, 'core')
  const asset = generateSigner(umi)

  const { signature } = await create(umi, {
    asset,
    name: params.name,
    uri: params.uri,
  }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } })

  return {
    signature: String(signature),
    mintAddress: asset.publicKey.toString(),
    name: params.name,
    mintType: 'core',
  }
}

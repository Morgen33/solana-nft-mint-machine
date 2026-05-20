import { createNft } from '@metaplex-foundation/mpl-token-metadata'
import { generateSigner, percentAmount } from '@metaplex-foundation/umi'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import type { SolanaCluster } from '../network'
import type { MintParams, MintResult, SimulationResult } from './types'
import { createUmiForWallet } from './umi'

export async function simulateClassicMint(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
): Promise<SimulationResult> {
  const umi = createUmiForWallet(wallet, cluster, 'classic')
  const mint = generateSigner(umi)

  try {
    const transaction = await createNft(umi, {
      mint,
      name: params.name,
      uri: params.uri,
      sellerFeeBasisPoints: percentAmount(params.sellerFeeBasisPoints, 2),
      symbol: params.symbol,
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

export async function mintClassicNft(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
): Promise<MintResult> {
  const umi = createUmiForWallet(wallet, cluster, 'classic')
  const mint = generateSigner(umi)

  const { signature } = await createNft(umi, {
    mint,
    name: params.name,
    uri: params.uri,
    sellerFeeBasisPoints: percentAmount(params.sellerFeeBasisPoints, 2),
    symbol: params.symbol,
  }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } })

  return {
    signature: String(signature),
    mintAddress: mint.publicKey.toString(),
    name: params.name,
    mintType: 'classic',
  }
}

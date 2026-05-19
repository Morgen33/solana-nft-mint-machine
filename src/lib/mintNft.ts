import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { mplToolbox } from '@metaplex-foundation/mpl-toolbox'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { generateSigner, percentAmount, type Umi } from '@metaplex-foundation/umi'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import type { SolanaCluster } from './network'
import { CLUSTER_ENDPOINTS } from './network'

export type MintParams = {
  name: string
  uri: string
  sellerFeeBasisPoints: number
  symbol?: string
}

export type MintResult = {
  signature: string
  mintAddress: string
  name: string
}

export type SimulationResult = {
  success: boolean
  unitsConsumed?: number
  error?: string
}

function createUmiForWallet(wallet: WalletAdapter, cluster: SolanaCluster): Umi {
  const umi = createUmi(CLUSTER_ENDPOINTS[cluster])
    .use(mplTokenMetadata())
    .use(mplToolbox())
    .use(walletAdapterIdentity(wallet))

  return umi
}

export async function simulateMint(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
): Promise<SimulationResult> {
  const umi = createUmiForWallet(wallet, cluster)
  const mint = generateSigner(umi)

  try {
    const builder = createNft(umi, {
      mint,
      name: params.name,
      uri: params.uri,
      sellerFeeBasisPoints: percentAmount(params.sellerFeeBasisPoints, 2),
      symbol: params.symbol,
    })

    const transaction = await builder.buildAndSign(umi)
    const simulation = await umi.rpc.simulateTransaction(transaction, {
      commitment: 'confirmed',
    })

    if (simulation.err) {
      return {
        success: false,
        error: JSON.stringify(simulation.err),
      }
    }

    return {
      success: true,
      unitsConsumed: simulation.unitsConsumed ?? undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function mintSingleNft(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
): Promise<MintResult> {
  const umi = createUmiForWallet(wallet, cluster)
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
  }
}

export async function mintBatch(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  params: MintParams,
  quantity: number,
  onProgress?: (current: number, total: number, result: MintResult) => void,
): Promise<MintResult[]> {
  const results: MintResult[] = []

  for (let i = 0; i < quantity; i++) {
    const suffix = quantity > 1 ? ` #${i + 1}` : ''
    const result = await mintSingleNft(wallet, cluster, {
      ...params,
      name: `${params.name}${suffix}`,
    })
    results.push(result)
    onProgress?.(i + 1, quantity, result)
  }

  return results
}

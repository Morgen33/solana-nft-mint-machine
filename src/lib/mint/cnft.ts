import { createTree, mintV2 } from '@metaplex-foundation/mpl-bubblegum'
import {
  generateSigner,
  none,
  publicKey,
  type PublicKey,
} from '@metaplex-foundation/umi'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import { CNFT_TREE_MAX_DEPTH } from '../cnftTree'
import type { SolanaCluster } from '../network'
import type { MintParams, MintResult, SimulationResult } from './types'
import { createUmiForWallet } from './umi'

export type CreateTreeResult = {
  signature: string
  treeAddress: string
}

export async function createCnftTree(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
): Promise<CreateTreeResult> {
  const umi = createUmiForWallet(wallet, cluster, 'cnft')
  const merkleTree = generateSigner(umi)

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: CNFT_TREE_MAX_DEPTH,
    maxBufferSize: 8,
    canopyDepth: 5,
    public: false,
  })

  const { signature } = await builder.sendAndConfirm(umi, {
    confirm: { commitment: 'confirmed' },
  })

  return {
    signature: String(signature),
    treeAddress: merkleTree.publicKey.toString(),
  }
}

export async function simulateCnftMint(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  treeAddress: string,
  params: MintParams,
): Promise<SimulationResult> {
  const umi = createUmiForWallet(wallet, cluster, 'cnft')

  try {
    const transaction = await mintV2(umi, {
      leafOwner: umi.identity.publicKey,
      merkleTree: publicKey(treeAddress),
      metadata: buildCnftMetadata(umi.identity.publicKey, params),
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

export async function mintCnft(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  treeAddress: string,
  params: MintParams,
): Promise<MintResult> {
  const umi = createUmiForWallet(wallet, cluster, 'cnft')

  const { signature } = await mintV2(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree: publicKey(treeAddress),
    metadata: buildCnftMetadata(umi.identity.publicKey, params),
  }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } })

  return {
    signature: String(signature),
    mintAddress: treeAddress,
    name: params.name,
    mintType: 'cnft',
  }
}

function buildCnftMetadata(creator: PublicKey, params: MintParams) {
  return {
    name: params.name,
    symbol: params.symbol ?? 'NFT',
    uri: params.uri,
    sellerFeeBasisPoints: params.sellerFeeBasisPoints,
    creators: [
      {
        address: creator,
        verified: false,
        share: 100,
      },
    ],
    collection: none<PublicKey>(),
  }
}

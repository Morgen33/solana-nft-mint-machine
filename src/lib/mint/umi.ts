import { mplBubblegum } from '@metaplex-foundation/mpl-bubblegum'
import { mplCore } from '@metaplex-foundation/mpl-core'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { mplToolbox } from '@metaplex-foundation/mpl-toolbox'
import type { Umi } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import type { SolanaCluster } from '../network'
import { CLUSTER_ENDPOINTS } from '../network'
import type { MintType } from './types'

export function createUmiForWallet(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  mintType: MintType,
): Umi {
  let umi = createUmi(CLUSTER_ENDPOINTS[cluster])
    .use(mplToolbox())
    .use(walletAdapterIdentity(wallet))

  if (mintType === 'classic') {
    umi = umi.use(mplTokenMetadata())
  } else if (mintType === 'core') {
    umi = umi.use(mplCore())
  } else {
    umi = umi.use(mplBubblegum())
  }

  return umi
}

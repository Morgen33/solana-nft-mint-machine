import { useMemo, type ReactNode } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import type { SolanaCluster } from '../lib/network'
import { CLUSTER_ENDPOINTS } from '../lib/network'

type Props = {
  children: ReactNode
  cluster: SolanaCluster
}

export function SolanaWalletProvider({ children, cluster }: Props) {
  const endpoint = CLUSTER_ENDPOINTS[cluster]

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

import { useState } from 'react'
import { MintMachine } from './components/MintMachine'
import { SolanaWalletProvider } from './components/SolanaWalletProvider'
import type { SolanaCluster } from './lib/network'

export default function App() {
  const [cluster, setCluster] = useState<SolanaCluster>('mainnet-beta')

  return (
    <SolanaWalletProvider cluster={cluster}>
      <div className="min-h-screen px-4 py-10 sm:px-6">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-xl border border-zinc-700/80 bg-zinc-900/60 p-1 text-sm">
            <ClusterTab
              active={cluster === 'devnet'}
              onClick={() => setCluster('devnet')}
              label="Devnet"
            />
            <ClusterTab
              active={cluster === 'mainnet-beta'}
              onClick={() => setCluster('mainnet-beta')}
              label="Mainnet"
              warn
            />
          </div>
        </div>
        <MintMachine cluster={cluster} />
        <footer className="mx-auto mt-12 max-w-2xl text-center text-xs text-zinc-600">
          Classic, Core, or Compressed NFTs · Simulates before signing · Not financial advice
        </footer>
      </div>
    </SolanaWalletProvider>
  )
}

function ClusterTab({
  active,
  onClick,
  label,
  warn,
}: {
  active: boolean
  onClick: () => void
  label: string
  warn?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 font-medium transition ${
        active
          ? warn
            ? 'bg-amber-500/20 text-amber-200'
            : 'bg-violet-600 text-white'
          : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  )
}

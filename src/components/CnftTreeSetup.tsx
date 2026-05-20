import { useCallback, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { CNFT_TREE_CAPACITY } from '../lib/cnftTree'
import { createCnftTree } from '../lib/mint'
import type { SolanaCluster } from '../lib/network'
import { explorerTxUrl } from '../lib/network'

type Props = {
  cluster: SolanaCluster
  treeAddress: string | null
  onTreeCreated: (address: string) => void
  onClearTree: () => void
  disabled?: boolean
}

export function CnftTreeSetup({
  cluster,
  treeAddress,
  onTreeCreated,
  onClearTree,
  disabled,
}: Props) {
  const { wallet, connected } = useWallet()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastTx, setLastTx] = useState<string | null>(null)

  const handleCreateTree = useCallback(async () => {
    if (!connected || !wallet?.adapter) {
      setError('Connect your wallet first.')
      return
    }

    setBusy(true)
    setError(null)
    setLastTx(null)

    try {
      const { treeAddress: created, signature } = await createCnftTree(
        wallet.adapter,
        cluster,
      )
      onTreeCreated(created)
      setLastTx(signature)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes('User rejected')
            ? 'Cancelled in wallet.'
            : err.message
          : String(err),
      )
    } finally {
      setBusy(false)
    }
  }, [cluster, connected, onTreeCreated, wallet?.adapter])

  if (treeAddress) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-200">Step 1 done — storage ready</p>
            <p className="mt-1 text-xs text-emerald-100/80">
              Your private tree holds up to {CNFT_TREE_CAPACITY} compressed NFTs. Only your wallet
              can mint into it.
            </p>
            <p className="mt-2 font-mono text-[11px] text-emerald-300/90 break-all">{treeAddress}</p>
          </div>
          <button
            type="button"
            className="text-xs text-zinc-400 underline hover:text-zinc-200"
            onClick={onClearTree}
            disabled={disabled || busy}
          >
            Reset tree
          </button>
        </div>
        {lastTx && (
          <a
            href={explorerTxUrl(lastTx, cluster)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-cyan-400 hover:text-cyan-300"
          >
            View setup transaction →
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-amber-100">Step 1 — Create your storage tree</p>
        <p className="mt-1 text-xs text-amber-100/80 leading-relaxed">
          Compressed NFTs need a one-time “filing cabinet” on-chain. You pay this setup once (~$5–15
          on mainnet), then each copy is pennies. Your wallet owns the tree — only you can mint
          into it.
        </p>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="button"
        onClick={() => void handleCreateTree()}
        disabled={disabled || busy || !connected}
        className="w-full rounded-xl border border-amber-400/50 bg-amber-500/20 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-500/30 disabled:opacity-40"
      >
        {busy ? 'Approve in wallet…' : 'Create storage tree (one-time)'}
      </button>
    </div>
  )
}

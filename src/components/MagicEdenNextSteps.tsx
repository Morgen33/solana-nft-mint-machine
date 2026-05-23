import { useState } from 'react'
import type { MintType } from '../lib/mint'
import { MAGIC_EDEN_LINKS, copyToClipboard } from '../lib/magicEden'

type Props = {
  mintType: MintType
  collectionName: string
  collectionSymbol: string
  /** Merkle tree for compressed NFTs */
  treeAddress?: string | null
  /** Wallet that minted (creator) */
  creatorWallet?: string
  /** Example mint / asset from this batch */
  sampleMintAddress?: string
}

export function MagicEdenNextSteps({
  mintType,
  collectionName,
  collectionSymbol,
  treeAddress,
  creatorWallet,
  sampleMintAddress,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = async (key: string, value: string) => {
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const standardLabel =
    mintType === 'cnft'
      ? 'Compressed NFTs (cNFT)'
      : mintType === 'core'
        ? 'Metaplex Core'
        : 'NFT Legacy (Token Metadata)'

  return (
    <section className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-5">
      <h3 className="text-base font-semibold text-emerald-100">List on Magic Eden</h3>
      <p className="mt-2 text-sm text-zinc-300">
        Minting here does not auto-list your collection. Magic Eden indexes Solana NFTs through{' '}
        <strong className="font-medium text-zinc-200">Creator Hub</strong> — often within minutes
        after you submit, but it is not instant at mint time.
      </p>

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
        <li>
          Open{' '}
          <a
            href={MAGIC_EDEN_LINKS.creatorHub}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Creator Hub
          </a>{' '}
          (US:{' '}
          <a
            href={MAGIC_EDEN_LINKS.creatorHubUs}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300"
          >
            creators.magiceden.us
          </a>
          ) and sign in.
        </li>
        <li>
          Click <strong className="text-zinc-200">Create a Collection</strong> → Solana → apply for
          listing (or <strong className="text-zinc-200">Claim</strong> if already auto-listed).
        </li>
        <li>
          Enter name <strong className="text-zinc-200">{collectionName || 'your collection name'}</strong>{' '}
          and symbol <strong className="text-zinc-200">{collectionSymbol || 'SYMBOL'}</strong>.
        </li>
        <li>
          Choose standard: <strong className="text-zinc-200">{standardLabel}</strong>
          {mintType === 'cnft' && (
            <> — paste your <strong className="text-zinc-200">Merkle Tree Address</strong> below.</>
          )}
          {mintType === 'core' && (
            <> — use your <strong className="text-zinc-200">Metaplex Core Collection (MCC)</strong> address if you created one; otherwise use sample asset / creator info per ME’s form.</>
          )}
          {mintType === 'classic' && (
            <> — use verified creator address, candy machine, or hash list per ME’s form.</>
          )}
        </li>
        <li>Submit. Many Solana collections process quickly; fully minted collections not yet visible need the manual listing checkbox in Creator Hub.</li>
      </ol>

      <div className="mt-4 space-y-2">
        {mintType === 'cnft' && treeAddress && (
          <CopyRow
            label="Merkle tree address (required for cNFT listing)"
            value={treeAddress}
            copyKey="tree"
            copiedKey={copiedKey}
            onCopy={copy}
          />
        )}
        {creatorWallet && (
          <CopyRow
            label="Creator wallet"
            value={creatorWallet}
            copyKey="wallet"
            copiedKey={copiedKey}
            onCopy={copy}
          />
        )}
        {sampleMintAddress && mintType !== 'cnft' && (
          <CopyRow
            label="Sample mint address (from this batch)"
            value={sampleMintAddress}
            copyKey="mint"
            copiedKey={copiedKey}
            onCopy={copy}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <a
          href={MAGIC_EDEN_LINKS.creatorHub}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-emerald-600/80 px-4 py-2 font-medium text-white hover:bg-emerald-500/90"
        >
          Open Creator Hub →
        </a>
        <a
          href={MAGIC_EDEN_LINKS.listCollectionGuide}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-200 hover:bg-zinc-800/80"
        >
          Official listing guide
        </a>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        “Immediately” on Magic Eden means after Creator Hub submission and their indexer picks up your
        tree or collection — not at the moment you click Launch here. There is no public API to
        register listings from this app without a Magic Eden partnership.
      </p>
    </section>
  )
}

function CopyRow({
  label,
  value,
  copyKey,
  copiedKey,
  onCopy,
}: {
  label: string
  value: string
  copyKey: string
  copiedKey: string | null
  onCopy: (key: string, value: string) => void
}) {
  return (
    <div className="rounded-lg bg-zinc-950/60 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <code className="break-all font-mono text-xs text-zinc-200">{value}</code>
        <button
          type="button"
          onClick={() => onCopy(copyKey, value)}
          className="shrink-0 rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          {copiedKey === copyKey ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

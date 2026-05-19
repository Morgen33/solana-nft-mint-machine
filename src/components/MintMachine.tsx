import { useCallback, useState, type ReactNode } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  buildMetadataJson,
  downloadMetadataJson,
  parseAttributesJson,
} from '../lib/metadata'
import { mintBatch, simulateMint } from '../lib/mintNft'
import type { MintResult } from '../lib/mintNft'
import type { SolanaCluster } from '../lib/network'
import { explorerTxUrl } from '../lib/network'

type Props = {
  cluster: SolanaCluster
}

type MintPhase = 'idle' | 'simulating' | 'minting' | 'done' | 'error'

const EXAMPLE_ATTRIBUTES = `[
  { "trait_type": "Rarity", "value": "Legendary" },
  { "trait_type": "Edition", "value": "1" }
]`

export function MintMachine({ cluster }: Props) {
  const { publicKey, wallet, connected } = useWallet()

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('NFT')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [metadataUri, setMetadataUri] = useState('')
  const [attributesJson, setAttributesJson] = useState('')
  const [royaltyPercent, setRoyaltyPercent] = useState('5')
  const [quantity, setQuantity] = useState('1')

  const [phase, setPhase] = useState<MintPhase>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [simulationUnits, setSimulationUnits] = useState<number | null>(null)
  const [results, setResults] = useState<MintResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const sellerFeeBasisPoints = Math.round(
    Math.min(100, Math.max(0, Number(royaltyPercent) || 0)) * 100,
  )

  const handleDownloadMetadata = useCallback(() => {
    try {
      const attributes = parseAttributesJson(attributesJson)
      const json = buildMetadataJson({
        name,
        symbol,
        description,
        imageUrl,
        attributes,
      })
      const safeName = (name || 'nft').replace(/\s+/g, '-').toLowerCase()
      downloadMetadataJson(json, `${safeName}-metadata.json`)
      setStatusMessage(
        'Metadata JSON downloaded. Upload it to IPFS or Arweave, then paste the URI below.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [attributesJson, description, imageUrl, name, symbol])

  const handleMint = useCallback(async () => {
    setError(null)
    setResults([])
    setSimulationUnits(null)

    if (!connected || !wallet?.adapter || !publicKey) {
      setError('Connect a wallet first.')
      return
    }

    if (!metadataUri.trim()) {
      setError('Metadata URI is required (host your JSON on IPFS or Arweave).')
      return
    }

    if (!name.trim()) {
      setError('Collection / NFT name is required.')
      return
    }

    const qty = Math.min(20, Math.max(1, Number(quantity) || 1))
    const params = {
      name: name.trim(),
      uri: metadataUri.trim(),
      sellerFeeBasisPoints,
      symbol: symbol.trim() || undefined,
    }

    setPhase('simulating')
    setStatusMessage('Simulating transaction before wallet approval…')

    const simulation = await simulateMint(wallet.adapter, cluster, params)
    if (!simulation.success) {
      setPhase('error')
      setError(simulation.error ?? 'Simulation failed')
      setStatusMessage('')
      return
    }

    setSimulationUnits(simulation.unitsConsumed ?? null)
    setPhase('minting')
    setStatusMessage(`Minting ${qty} NFT${qty > 1 ? 's' : ''}… approve in your wallet.`)

    try {
      const minted = await mintBatch(
        wallet.adapter,
        cluster,
        params,
        qty,
        (current, total) => {
          setStatusMessage(`Minted ${current} of ${total}…`)
        },
      )
      setResults(minted)
      setPhase('done')
      setStatusMessage(`Successfully minted ${minted.length} NFT${minted.length > 1 ? 's' : ''}.`)
    } catch (err) {
      setPhase('error')
      const message =
        err instanceof Error
          ? err.message.includes('User rejected')
            ? 'Transaction cancelled in wallet.'
            : err.message
          : String(err)
      setError(message)
      setStatusMessage('')
    }
  }, [
    cluster,
    connected,
    metadataUri,
    name,
    publicKey,
    quantity,
    sellerFeeBasisPoints,
    symbol,
    wallet?.adapter,
  ])

  const isBusy = phase === 'simulating' || phase === 'minting'

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl shadow-lg shadow-violet-900/40">
            ⚡
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              NFT Mint Machine
            </h1>
            <p className="text-sm text-zinc-400">
              Metaplex Token Metadata · {cluster === 'devnet' ? 'Devnet' : 'Mainnet'}
            </p>
          </div>
        </div>
        <WalletMultiButton />
      </header>

      {cluster === 'mainnet-beta' && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          You are on <strong>mainnet</strong>. Real SOL is spent on rent and fees.
        </div>
      )}

      <form
        className="space-y-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl backdrop-blur"
        onSubmit={(e) => {
          e.preventDefault()
          void handleMint()
        }}
      >
        <Field label="Name" required>
          <input
            className={inputClass}
            placeholder="Cosmic Ape #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isBusy}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Symbol">
            <input
              className={inputClass}
              placeholder="CAPE"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={isBusy}
            />
          </Field>
          <Field label="Royalty %" hint="Creator royalty on secondary sales">
            <input
              className={inputClass}
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={royaltyPercent}
              onChange={(e) => setRoyaltyPercent(e.target.value)}
              disabled={isBusy}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            className={`${inputClass} min-h-20 resize-y`}
            placeholder="A one-of-one digital collectible…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isBusy}
          />
        </Field>

        <Field label="Image URL" hint="HTTPS link to your artwork (used in metadata JSON)">
          <input
            className={inputClass}
            placeholder="https://arweave.net/… or https://ipfs.io/ipfs/…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isBusy}
          />
        </Field>

        <Field
          label="Attributes (JSON)"
          hint="Optional traits — paste or edit the example"
        >
          <textarea
            className={`${inputClass} min-h-24 font-mono text-xs`}
            placeholder={EXAMPLE_ATTRIBUTES}
            value={attributesJson}
            onChange={(e) => setAttributesJson(e.target.value)}
            disabled={isBusy}
          />
        </Field>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={handleDownloadMetadata}
            disabled={isBusy || !name || !imageUrl}
          >
            Download metadata JSON
          </button>
        </div>

        <Field
          label="Metadata URI"
          required
          hint="Upload the JSON to IPFS/Arweave, then paste the link here"
        >
          <input
            className={inputClass}
            placeholder="https://arweave.net/… or ipfs://…"
            value={metadataUri}
            onChange={(e) => setMetadataUri(e.target.value)}
            disabled={isBusy}
          />
        </Field>

        <Field label="Quantity" hint="Batch mint up to 20 (numbered #1, #2, …)">
          <input
            className={inputClass}
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={isBusy}
          />
        </Field>

        {connected && publicKey && (
          <p className="text-xs text-zinc-500">
            Minting as{' '}
            <span className="font-mono text-zinc-400">
              {publicKey.toBase58().slice(0, 4)}…{publicKey.toBase58().slice(-4)}
            </span>
            {' · '}
            Est. compute: {simulationUnits != null ? simulationUnits.toLocaleString() : '—'} CU
          </p>
        )}

        {statusMessage && (
          <p className="rounded-lg bg-violet-500/10 px-3 py-2 text-sm text-violet-200">
            {statusMessage}
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          className={primaryButtonClass}
          disabled={isBusy || !connected}
        >
          {phase === 'simulating'
            ? 'Simulating…'
            : phase === 'minting'
              ? 'Minting…'
              : `Mint ${Math.min(20, Math.max(1, Number(quantity) || 1))} NFT`}
        </button>

        {!connected && (
          <p className="text-center text-sm text-zinc-500">
            Connect Phantom or Solflare to mint on {cluster}.
          </p>
        )}
      </form>

      {results.length > 0 && (
        <section className="mt-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Minted</h2>
          <ul className="space-y-3">
            {results.map((r) => (
              <li
                key={r.mintAddress}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-800/50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-zinc-200">{r.name}</span>
                <span className="font-mono text-xs text-zinc-500">{r.mintAddress}</span>
                <a
                  href={explorerTxUrl(r.signature, cluster)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  View tx →
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1 text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="text-violet-400">*</span>}
      </span>
      {hint && <span className="mb-2 block text-xs text-zinc-500">{hint}</span>}
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50'

const primaryButtonClass =
  'w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40'

const secondaryButtonClass =
  'rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-40'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { clearTreeAddress, loadTreeAddress, saveTreeAddress } from '../lib/cnftTree'
import {
  buildMetadataJson,
  downloadMetadataJson,
  parseAttributesJson,
} from '../lib/metadata'
import { mintBatch, simulateMint } from '../lib/mint'
import type { MintResult, MintType } from '../lib/mint'
import { getMintOption } from '../lib/mintOptions'
import type { SolanaCluster } from '../lib/network'
import { explorerTxUrl } from '../lib/network'
import { ArweaveUpload } from './ArweaveUpload'
import { CnftTreeSetup } from './CnftTreeSetup'
import { NftTypePicker } from './NftTypePicker'

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

  const [mintType, setMintType] = useState<MintType>('cnft')
  const [treeAddress, setTreeAddress] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('NFT')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [metadataUri, setMetadataUri] = useState('')
  const [attributesJson, setAttributesJson] = useState('')
  const [royaltyPercent, setRoyaltyPercent] = useState('5')
  const [quantity, setQuantity] = useState('20')

  const [phase, setPhase] = useState<MintPhase>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [simulationUnits, setSimulationUnits] = useState<number | null>(null)
  const [results, setResults] = useState<MintResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showManualUrls, setShowManualUrls] = useState(false)
  const [arweaveReady, setArweaveReady] = useState(false)

  const sellerFeeBasisPoints = Math.round(
    Math.min(100, Math.max(0, Number(royaltyPercent) || 0)) * 100,
  )

  const walletKey = publicKey?.toBase58() ?? ''

  useEffect(() => {
    if (!walletKey) {
      setTreeAddress(null)
      return
    }
    setTreeAddress(loadTreeAddress(cluster, walletKey))
  }, [cluster, walletKey])

  const handleMintTypeChange = (type: MintType) => {
    setMintType(type)
    if (type === 'cnft' && Number(quantity) < 2) {
      setQuantity('20')
    }
  }

  const handleTreeCreated = (address: string) => {
    setTreeAddress(address)
    if (walletKey) saveTreeAddress(cluster, walletKey, address)
  }

  const handleClearTree = () => {
    if (walletKey) clearTreeAddress(cluster, walletKey)
    setTreeAddress(null)
  }

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
        'Metadata downloaded. Upload to Arweave (permanent), then paste ONE link below — same link for all copies.',
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

    if (mintType === 'cnft' && !treeAddress) {
      setError('Create your storage tree first (Step 1 above).')
      return
    }

    if (!metadataUri.trim()) {
      setError('Metadata URI is required — your permanent Arweave (or other) link to the JSON file.')
      return
    }

    if (!name.trim()) {
      setError('Name is required.')
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
    setStatusMessage('Checking transaction before wallet approval…')

    const simulation = await simulateMint(
      mintType,
      wallet.adapter,
      cluster,
      params,
      treeAddress ?? undefined,
    )
    if (!simulation.success) {
      setPhase('error')
      setError(simulation.error ?? 'Simulation failed')
      setStatusMessage('')
      return
    }

    setSimulationUnits(simulation.unitsConsumed ?? null)
    setPhase('minting')
    setStatusMessage(
      `Minting ${qty} ${getMintOption(mintType).title} NFT${qty > 1 ? 's' : ''}… approve each prompt in your wallet.`,
    )

    try {
      const minted = await mintBatch(
        mintType,
        wallet.adapter,
        cluster,
        params,
        qty,
        treeAddress ?? undefined,
        (current, total) => {
          setStatusMessage(`Minted ${current} of ${total}…`)
        },
      )
      setResults(minted)
      setPhase('done')
      setStatusMessage(`Done — ${minted.length} NFT${minted.length > 1 ? 's' : ''} minted.`)
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
    mintType,
    name,
    publicKey,
    quantity,
    sellerFeeBasisPoints,
    symbol,
    treeAddress,
    wallet?.adapter,
  ])

  const isBusy = phase === 'simulating' || phase === 'minting'
  const qty = Math.min(20, Math.max(1, Number(quantity) || 1))
  const selectedOption = getMintOption(mintType)
  const cnftReady = mintType !== 'cnft' || Boolean(treeAddress)
  const canSubmit = connected && cnftReady && !isBusy

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl shadow-lg shadow-violet-900/40">
            ⚡
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">NFT Mint Machine</h1>
            <p className="text-sm text-zinc-400">
              {cluster === 'devnet' ? 'Practice mode' : 'Mainnet'} · Choose your NFT type below
            </p>
          </div>
        </div>
        <WalletMultiButton />
      </header>

      {cluster === 'mainnet-beta' && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <strong>Real money.</strong> Wallet must be on Mainnet with enough SOL for fees.
        </div>
      )}

      <form
        className="space-y-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl backdrop-blur"
        onSubmit={(e) => {
          e.preventDefault()
          void handleMint()
        }}
      >
        <NftTypePicker value={mintType} onChange={handleMintTypeChange} disabled={isBusy} />

        {mintType === 'cnft' && (
          <>
            <CnftTreeSetup
              cluster={cluster}
              treeAddress={treeAddress}
              onTreeCreated={handleTreeCreated}
              onClearTree={handleClearTree}
              disabled={isBusy}
            />
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100/90">
              <strong>Same image for all {qty}?</strong> Use one Metadata URI for every copy. Names
              will be numbered automatically ({name || 'Your Name'} #1, #2, …).
            </div>
          </>
        )}

        <div className="border-t border-zinc-800/80 pt-2">
          <p className="mb-4 text-sm font-medium text-zinc-300">
            {mintType === 'cnft' ? 'Step 2 — Art & details' : 'Art & details'}
          </p>

          <div className="space-y-5">
            <Field label="Name" required>
              <input
                className={inputClass}
                placeholder="My Collection"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isBusy}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Symbol">
                <input
                  className={inputClass}
                  placeholder="MYNFT"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  disabled={isBusy}
                />
              </Field>
              <Field label="Royalty %" hint="Paid to you on resales only">
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
                placeholder="What is this NFT?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isBusy}
              />
            </Field>

            <Field label="Attributes (JSON)" hint="Optional">
              <textarea
                className={`${inputClass} min-h-24 font-mono text-xs`}
                placeholder={EXAMPLE_ATTRIBUTES}
                value={attributesJson}
                onChange={(e) => setAttributesJson(e.target.value)}
                disabled={isBusy}
              />
            </Field>

            <ArweaveUpload
              cluster={cluster}
              disabled={isBusy}
              name={name}
              symbol={symbol}
              description={description}
              attributesJson={attributesJson}
              onUploaded={(image, metadata) => {
                setImageUrl(image)
                setMetadataUri(metadata)
                setArweaveReady(true)
                setStatusMessage(
                  'Arweave links ready. Same metadata URI works for all copies in your batch.',
                )
              }}
            />

            <button
              type="button"
              className="text-xs text-zinc-500 underline hover:text-zinc-300"
              onClick={() => setShowManualUrls((v) => !v)}
            >
              {showManualUrls
                ? 'Hide manual links'
                : 'Already have Arweave links? Paste them manually'}
            </button>

            {showManualUrls && (
              <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <Field label="Image URL" hint="arweave.net or other permanent URL">
                  <input
                    className={inputClass}
                    placeholder="https://arweave.net/…"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      setArweaveReady(false)
                    }}
                    disabled={isBusy}
                  />
                </Field>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={handleDownloadMetadata}
                  disabled={isBusy || !name || !imageUrl}
                >
                  Download metadata JSON
                </button>
                <Field label="Metadata URI" hint="One link for all batch copies">
                  <input
                    className={inputClass}
                    placeholder="https://arweave.net/…"
                    value={metadataUri}
                    onChange={(e) => {
                      setMetadataUri(e.target.value)
                      setArweaveReady(false)
                    }}
                    disabled={isBusy}
                  />
                </Field>
              </div>
            )}

            {(arweaveReady || metadataUri) && (
              <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400 space-y-1">
                <p>
                  <span className="text-zinc-500">Image:</span>{' '}
                  <span className="font-mono text-zinc-300 break-all">{imageUrl || '—'}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Metadata:</span>{' '}
                  <span className="font-mono text-zinc-300 break-all">{metadataUri || '—'}</span>
                </p>
              </div>
            )}

            <Field
              label="How many to mint?"
              hint={`${selectedOption.title} · up to 20 per batch`}
            >
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
          </div>
        </div>

        {connected && publicKey && (
          <p className="text-xs text-zinc-500">
            Wallet {publicKey.toBase58().slice(0, 4)}…{publicKey.toBase58().slice(-4)}
            {simulationUnits != null && ` · ~${simulationUnits.toLocaleString()} compute units`}
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

        <button type="submit" className={primaryButtonClass} disabled={!canSubmit}>
          {phase === 'simulating'
            ? 'Checking…'
            : phase === 'minting'
              ? `Minting ${qty}…`
              : mintType === 'cnft' && !treeAddress
                ? 'Complete Step 1 first'
                : `Mint ${qty} ${selectedOption.title} NFT${qty > 1 ? 's' : ''}`}
        </button>

        {!connected && (
          <p className="text-center text-sm text-zinc-500">
            Connect Phantom or Solflare to continue.
          </p>
        )}
      </form>

      {results.length > 0 && (
        <section className="mt-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Minted</h2>
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li
                key={`${r.signature}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-800/50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-zinc-200">{r.name}</span>
                {r.mintType !== 'cnft' && (
                  <span className="font-mono text-xs text-zinc-500">{r.mintAddress}</span>
                )}
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
          {mintType === 'cnft' && (
            <p className="mt-4 text-xs text-zinc-500">
              Compressed NFTs appear in Phantom under your collectibles. Each mint is a separate
              transaction — you may need to approve up to {results.length} times.
            </p>
          )}
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

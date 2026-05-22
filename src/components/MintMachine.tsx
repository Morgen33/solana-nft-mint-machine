import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { uploadImageAndMetadataToArweave } from '../lib/arweave/upload'
import { loadTreeAddress, saveTreeAddress } from '../lib/cnftTree'
import {
  attributesToJson,
  buildAttributesFromSimpleTraits,
  buildMetadataJson,
  downloadMetadataJson,
  parseAttributesJson,
} from '../lib/metadata'
import { createCnftTree, mintBatch, simulateMint } from '../lib/mint'
import type { MintResult, MintType } from '../lib/mint'
import { getMintOption } from '../lib/mintOptions'
import type { SolanaCluster } from '../lib/network'
import { explorerTxUrl } from '../lib/network'
import { ArweaveUpload } from './ArweaveUpload'
import { MetadataPreview } from './MetadataPreview'
import { NftTypePicker } from './NftTypePicker'
import { SimpleTraits } from './SimpleTraits'

type Props = {
  cluster: SolanaCluster
}

type MintPhase =
  | 'idle'
  | 'creating-tree'
  | 'uploading'
  | 'simulating'
  | 'minting'
  | 'done'
  | 'error'

const DEFAULT_TRAITS = [
  { name: '', value: '' },
  { name: '', value: '' },
]

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
  const [simpleTraits, setSimpleTraits] = useState(DEFAULT_TRAITS)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showAdvancedJson, setShowAdvancedJson] = useState(false)
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

  const resolvedAttributes = useMemo(() => {
    if (showAdvancedJson && attributesJson.trim()) {
      try {
        return parseAttributesJson(attributesJson)
      } catch {
        return buildAttributesFromSimpleTraits(simpleTraits)
      }
    }
    return buildAttributesFromSimpleTraits(simpleTraits)
  }, [attributesJson, showAdvancedJson, simpleTraits])

  const resolvedAttributesJson = useMemo(
    () => attributesToJson(resolvedAttributes),
    [resolvedAttributes],
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

  const handleDownloadMetadata = useCallback(() => {
    try {
      const json = buildMetadataJson({
        name,
        symbol,
        description,
        imageUrl,
        attributes: resolvedAttributes,
        externalUrl: websiteUrl,
      })
      const safeName = (name || 'nft').replace(/\s+/g, '-').toLowerCase()
      downloadMetadataJson(json, `${safeName}-metadata.json`)
      setStatusMessage(
        'Metadata downloaded. Upload to Arweave (permanent), then paste ONE link below — same link for all copies.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [description, imageUrl, name, resolvedAttributes, symbol, websiteUrl])

  const runMint = useCallback(
    async (uri: string, tree: string | null) => {
      if (!wallet?.adapter) return

      const qty = Math.min(20, Math.max(1, Number(quantity) || 1))
      const params = {
        name: name.trim(),
        uri,
        sellerFeeBasisPoints,
        symbol: symbol.trim() || undefined,
      }

      setPhase('simulating')
      setStatusMessage('Checking mint transaction…')

      const simulation = await simulateMint(
        mintType,
        wallet.adapter,
        cluster,
        params,
        tree ?? undefined,
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
        `Minting ${qty} NFT${qty > 1 ? 's' : ''}… approve each wallet prompt.`,
      )

      const minted = await mintBatch(
        mintType,
        wallet.adapter,
        cluster,
        params,
        qty,
        tree ?? undefined,
        (current, total) => {
          setStatusMessage(`Minted ${current} of ${total}…`)
        },
      )
      setResults(minted)
      setPhase('done')
      setStatusMessage(`Launched — ${minted.length} NFT${minted.length > 1 ? 's' : ''} in your wallet.`)
    },
    [
      cluster,
      mintType,
      name,
      quantity,
      sellerFeeBasisPoints,
      symbol,
      wallet?.adapter,
    ],
  )

  const handleLaunch = useCallback(async () => {
    setError(null)
    setResults([])
    setSimulationUnits(null)

    if (!connected || !wallet?.adapter || !publicKey) {
      setError('Connect a wallet first.')
      return
    }

    if (!name.trim()) {
      setError('Enter a name for your NFT.')
      return
    }

    if (!imageFile && !metadataUri.trim()) {
      setError('Choose an image above — we need it to build your metadata.')
      return
    }

    let tree = treeAddress
    let uri = metadataUri.trim()

    try {
      if (mintType === 'cnft' && !tree) {
        setPhase('creating-tree')
        setStatusMessage('Step 1: Creating storage tree (one-time wallet approval)…')
        const created = await createCnftTree(wallet.adapter, cluster)
        tree = created.treeAddress
        setTreeAddress(tree)
        saveTreeAddress(cluster, walletKey, tree)
      }

      if (imageFile) {
        setPhase('uploading')
        setStatusMessage('Building metadata + saving to Arweave forever…')
        const uploaded = await uploadImageAndMetadataToArweave(
          wallet.adapter,
          cluster,
          {
            imageFile,
            name: name.trim(),
            symbol: symbol.trim() || 'NFT',
            description,
            attributesJson: resolvedAttributesJson,
            websiteUrl,
          },
          setStatusMessage,
        )
        uri = uploaded.metadataUri
        setImageUrl(uploaded.imageUri)
        setMetadataUri(uri)
        setArweaveReady(true)
      }

      if (!uri) {
        setPhase('error')
        setError('Metadata missing — upload your image or paste a metadata link.')
        return
      }

      setStatusMessage('Step 3: Minting on Solana…')
      await runMint(uri, tree)
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
    description,
    imageFile,
    metadataUri,
    mintType,
    name,
    publicKey,
    quantity,
    resolvedAttributesJson,
    runMint,
    symbol,
    treeAddress,
    wallet?.adapter,
    walletKey,
    websiteUrl,
  ])

  const isBusy =
    phase === 'creating-tree' ||
    phase === 'uploading' ||
    phase === 'simulating' ||
    phase === 'minting'
  const qty = Math.min(20, Math.max(1, Number(quantity) || 1))
  const selectedOption = getMintOption(mintType)
  const canLaunch =
    connected && !isBusy && name.trim() && (Boolean(imageFile) || Boolean(metadataUri.trim()))

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
          void handleLaunch()
        }}
      >
        <NftTypePicker value={mintType} onChange={handleMintTypeChange} disabled={isBusy} />

        {mintType === 'cnft' && treeAddress && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-200">
            Storage tree ready — launch will skip tree setup.
          </div>
        )}

        {mintType === 'cnft' && !treeAddress && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100/90">
            <strong>Launch</strong> will create your storage tree automatically (one wallet
            approval), then save to Arweave, then mint {qty} copies named{' '}
            {name || 'Your Name'} #1, #2, …
          </div>
        )}

        <div className="border-t border-zinc-800/80 pt-2">
          <p className="mb-1 text-sm font-medium text-zinc-300">Tell us about your NFT</p>
          <p className="mb-4 text-xs text-zinc-500">
            We turn this into standard metadata — no JSON editing required.
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

            <Field label="Website (optional)" hint="Shows as external link on some marketplaces">
              <input
                className={inputClass}
                placeholder="https://yoursite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={isBusy}
              />
            </Field>

            <SimpleTraits
              traits={simpleTraits}
              onChange={setSimpleTraits}
              disabled={isBusy}
            />

            <MetadataPreview
              name={name}
              symbol={symbol}
              description={description}
              imageUrl={imageUrl}
              attributes={resolvedAttributes}
              websiteUrl={websiteUrl}
            />

            <ArweaveUpload
              cluster={cluster}
              disabled={isBusy}
              name={name}
              symbol={symbol}
              description={description}
              attributesJson={resolvedAttributesJson}
              websiteUrl={websiteUrl}
              file={imageFile}
              onFileChange={(f) => {
                setImageFile(f)
                setArweaveReady(false)
              }}
              onUploaded={(image, metadata) => {
                setImageUrl(image)
                setMetadataUri(metadata)
                setArweaveReady(true)
                setStatusMessage('Saved on Arweave. Hit Launch to mint, or save early and mint later.')
              }}
            />

            <p className="text-center text-xs text-zinc-500">
              Optional: save to Arweave now, or let <strong>Launch</strong> do it for you.
            </p>

            <button
              type="button"
              className="text-xs text-zinc-500 underline hover:text-zinc-300"
              onClick={() => setShowAdvancedJson((v) => !v)}
            >
              {showAdvancedJson ? 'Hide advanced JSON traits' : 'Advanced: edit raw JSON traits'}
            </button>

            {showAdvancedJson && (
              <Field label="Attributes (JSON)">
                <textarea
                  className={`${inputClass} min-h-24 font-mono text-xs`}
                  placeholder={EXAMPLE_ATTRIBUTES}
                  value={attributesJson}
                  onChange={(e) => setAttributesJson(e.target.value)}
                  disabled={isBusy}
                />
              </Field>
            )}

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

        <button type="submit" className={launchButtonClass} disabled={!canLaunch}>
          {phase === 'creating-tree'
            ? 'Creating storage…'
            : phase === 'uploading'
              ? 'Saving to Arweave…'
              : phase === 'simulating'
                ? 'Checking…'
                : phase === 'minting'
                  ? `Minting ${qty}…`
                  : `🚀 Launch ${qty} NFT${qty > 1 ? 's' : ''}`}
        </button>

        <p className="text-center text-xs text-zinc-500">
          Launch = build metadata + Arweave + mint (wallet approvals along the way)
        </p>

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

const launchButtonClass =
  'w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 py-4 text-base font-bold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40'

const secondaryButtonClass =
  'rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-40'

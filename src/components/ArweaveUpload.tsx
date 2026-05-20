import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  estimateArweaveUploadCost,
  formatSolAmount,
  MAX_UPLOAD_BYTES,
  uploadImageAndMetadataToArweave,
} from '../lib/arweave/upload'
import type { SolanaCluster } from '../lib/network'

type Props = {
  cluster: SolanaCluster
  disabled?: boolean
  name: string
  symbol: string
  description: string
  attributesJson: string
  onUploaded: (imageUri: string, metadataUri: string) => void
}

export function ArweaveUpload({
  cluster,
  disabled,
  name,
  symbol,
  description,
  attributesJson,
  onUploaded,
}: Props) {
  const { wallet, connected } = useWallet()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [estimateSol, setEstimateSol] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    setDone(false)
    setEstimateSol(null)
    if (!file || !connected || !wallet?.adapter || !name.trim()) return

    let cancelled = false
    let safeAttributes = ''
    try {
      if (attributesJson.trim()) {
        JSON.parse(attributesJson)
        safeAttributes = attributesJson
      }
    } catch {
      setEstimateSol(null)
      return
    }

    void estimateArweaveUploadCost(
      wallet.adapter,
      cluster,
      file,
      { name, symbol, description },
      safeAttributes,
    )
      .then((amount) => {
        if (!cancelled) setEstimateSol(formatSolAmount(amount))
      })
      .catch(() => {
        if (!cancelled) setEstimateSol(null)
      })

    return () => {
      cancelled = true
    }
  }, [
    attributesJson,
    cluster,
    connected,
    description,
    file,
    name,
    symbol,
    wallet?.adapter,
  ])

  const handleFile = (picked: File | null) => {
    setError(null)
    setStatus(null)
    setDone(false)
    if (!picked) {
      setFile(null)
      return
    }
    if (!picked.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, GIF, WebP).')
      return
    }
    if (picked.size > MAX_UPLOAD_BYTES) {
      setError(`Max file size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`)
      return
    }
    setFile(picked)
  }

  const handleUpload = useCallback(async () => {
    if (!connected || !wallet?.adapter) {
      setError('Connect your wallet first.')
      return
    }
    if (!file) {
      setError('Choose an image first.')
      return
    }
    if (!name.trim()) {
      setError('Enter a name above before uploading.')
      return
    }

    setBusy(true)
    setError(null)
    setStatus(null)

    try {
      const result = await uploadImageAndMetadataToArweave(
        wallet.adapter,
        cluster,
        {
          imageFile: file,
          name: name.trim(),
          symbol: symbol.trim() || 'NFT',
          description,
          attributesJson,
        },
        setStatus,
      )
      onUploaded(result.imageUri, result.metadataUri)
      setDone(true)
      setStatus(
        `Stored forever on Arweave. Paid ~${result.estimatedCostSol} SOL from your wallet for storage.`,
      )
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
  }, [
    attributesJson,
    cluster,
    connected,
    description,
    file,
    name,
    onUploaded,
    symbol,
    wallet?.adapter,
  ])

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-emerald-100">
          Permanent storage on Arweave
        </p>
        <p className="mt-1 text-xs text-emerald-100/75 leading-relaxed">
          Pick your image here. Your wallet pays once to store it forever — no
          monthly pinning, no Pinata. We upload the image and metadata JSON for
          you automatically.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-500/40 bg-zinc-950/50 px-4 py-8 transition hover:border-emerald-400/60">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || busy}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded-lg object-contain"
          />
        ) : (
          <>
            <span className="text-3xl">🖼️</span>
            <span className="mt-2 text-sm font-medium text-zinc-200">
              Click to choose image
            </span>
            <span className="mt-1 text-xs text-zinc-500">Max 10 MB</span>
          </>
        )}
      </label>

      {file && estimateSol && (
        <p className="text-xs text-emerald-200/90">
          Estimated storage cost: <strong>~{estimateSol} SOL</strong> (paid from
          your wallet, one time)
        </p>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}
      {status && <p className="text-sm text-emerald-200">{status}</p>}

      {done && (
        <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100">
          Links filled in below. You can mint immediately — use the same metadata
          link for all copies.
        </p>
      )}

      <button
        type="button"
        disabled={disabled || busy || !connected || !file || !name.trim()}
        onClick={() => void handleUpload()}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
      >
        {busy ? 'Uploading to Arweave…' : 'Upload to Arweave (permanent)'}
      </button>
    </div>
  )
}

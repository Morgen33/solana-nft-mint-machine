import { useMemo, useState } from 'react'
import { buildMetadataJson, type NftAttribute } from '../lib/metadata'

type Props = {
  name: string
  symbol: string
  description: string
  imageUrl: string
  attributes: NftAttribute[]
  websiteUrl?: string
}

export function MetadataPreview({
  name,
  symbol,
  description,
  imageUrl,
  attributes,
  websiteUrl,
}: Props) {
  const [open, setOpen] = useState(false)

  const json = useMemo(() => {
    if (!name.trim()) return null
    return buildMetadataJson({
      name,
      symbol: symbol || 'NFT',
      description,
      imageUrl: imageUrl || 'https://arweave.net/your-image-will-go-here',
      attributes,
      externalUrl: websiteUrl,
    })
  }, [attributes, description, imageUrl, name, symbol, websiteUrl])

  if (!json) return null

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-300 hover:text-white"
      >
        <span>
          <span className="text-violet-400">✓</span> Metadata auto-built for you
          <span className="ml-2 text-xs text-zinc-500">(marketplaces read this file)</span>
        </span>
        <span className="text-zinc-500">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <pre className="max-h-48 overflow-auto border-t border-zinc-800 px-4 py-3 text-[11px] leading-relaxed text-zinc-400">
          {JSON.stringify(json, null, 2)}
        </pre>
      )}
    </div>
  )
}

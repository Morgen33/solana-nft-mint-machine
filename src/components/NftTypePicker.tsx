import { MINT_OPTIONS } from '../lib/mintOptions'
import type { MintType } from '../lib/mint/types'

type Props = {
  value: MintType
  onChange: (type: MintType) => void
  disabled?: boolean
}

export function NftTypePicker({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-300">What kind of NFT do you want?</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {MINT_OPTIONS.map((option) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={`relative rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-cyan-400/60 bg-cyan-500/10 ring-2 ring-cyan-400/30'
                  : 'border-zinc-700/80 bg-zinc-950/50 hover:border-zinc-600'
              } disabled:opacity-50`}
            >
              {option.badge && (
                <span className="absolute -top-2 right-3 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {option.badge}
                </span>
              )}
              <span className="text-2xl">{option.emoji}</span>
              <p className="mt-2 font-semibold text-white">{option.title}</p>
              <p className="mt-1 text-xs text-zinc-400">{option.tagline}</p>
              <p className="mt-2 text-xs font-medium text-cyan-300/90">{option.costLine}</p>
              <p className="mt-2 text-[11px] text-zinc-500">{option.bestFor}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

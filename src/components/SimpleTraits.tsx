type TraitRow = { name: string; value: string }

type Props = {
  traits: TraitRow[]
  onChange: (traits: TraitRow[]) => void
  disabled?: boolean
}

export function SimpleTraits({ traits, onChange, disabled }: Props) {
  const update = (index: number, field: 'name' | 'value', value: string) => {
    const next = [...traits]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-300">Traits (optional)</p>
      <p className="text-xs text-zinc-500">
        Like “Rarity: Legendary” — we add these to your metadata automatically.
      </p>
      {traits.map((trait, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder={i === 0 ? 'Rarity' : 'Edition'}
            value={trait.name}
            onChange={(e) => update(i, 'name', e.target.value)}
            disabled={disabled}
          />
          <input
            className={inputClass}
            placeholder={i === 0 ? 'Legendary' : '1'}
            value={trait.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50'

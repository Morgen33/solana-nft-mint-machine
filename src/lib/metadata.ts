export type NftAttribute = {
  trait_type: string
  value: string
}

export type NftMetadataInput = {
  name: string
  symbol: string
  description: string
  imageUrl: string
  attributes: NftAttribute[]
  externalUrl?: string
}

export type MetaplexMetadataJson = {
  name: string
  symbol: string
  description: string
  image: string
  attributes?: NftAttribute[]
  external_url?: string
  properties?: {
    files: Array<{ uri: string; type: string }>
    category: string
  }
}

export function buildMetadataJson(input: NftMetadataInput): MetaplexMetadataJson {
  const image = input.imageUrl.trim()
  const json: MetaplexMetadataJson = {
    name: input.name.trim(),
    symbol: input.symbol.trim(),
    description: input.description.trim(),
    image,
  }

  const attributes = input.attributes.filter(
    (a) => a.trait_type.trim() && a.value.trim(),
  )
  if (attributes.length > 0) {
    json.attributes = attributes
  }

  if (input.externalUrl?.trim()) {
    json.external_url = input.externalUrl.trim()
  }

  if (image.startsWith('http')) {
    json.properties = {
      category: 'image',
      files: [{ uri: image, type: guessImageMime(image) }],
    }
  }

  return json
}

function guessImageMime(url: string): string {
  const lower = url.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

export function buildAttributesFromSimpleTraits(
  traits: Array<{ name: string; value: string }>,
): NftAttribute[] {
  return traits
    .filter((t) => t.name.trim() && t.value.trim())
    .map((t) => ({ trait_type: t.name.trim(), value: t.value.trim() }))
}

export function attributesToJson(attributes: NftAttribute[]): string {
  if (attributes.length === 0) return ''
  return JSON.stringify(attributes, null, 2)
}

export function downloadMetadataJson(json: MetaplexMetadataJson, filename: string) {
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseAttributesJson(raw: string): NftAttribute[] {
  if (!raw.trim()) return []
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('Attributes must be a JSON array')
  }
  return parsed.map((item, index) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('trait_type' in item) ||
      !('value' in item)
    ) {
      throw new Error(`Invalid attribute at index ${index}`)
    }
    return {
      trait_type: String((item as NftAttribute).trait_type),
      value: String((item as NftAttribute).value),
    }
  })
}

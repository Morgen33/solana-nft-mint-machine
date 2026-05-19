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
}

export function buildMetadataJson(input: NftMetadataInput): MetaplexMetadataJson {
  const json: MetaplexMetadataJson = {
    name: input.name.trim(),
    symbol: input.symbol.trim(),
    description: input.description.trim(),
    image: input.imageUrl.trim(),
  }

  if (input.attributes.length > 0) {
    json.attributes = input.attributes.filter(
      (a) => a.trait_type.trim() && a.value.trim(),
    )
  }

  if (input.externalUrl?.trim()) {
    json.external_url = input.externalUrl.trim()
  }

  return json
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

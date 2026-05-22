import {
  createGenericFileFromBrowserFile,
  createGenericFileFromJson,
  type Amount,
} from '@metaplex-foundation/umi'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  buildMetadataJson,
  parseAttributesJson,
  type NftMetadataInput,
} from '../metadata'
import type { SolanaCluster } from '../network'
import { createUmiForUpload } from '../mint/umi'
import { toArweaveUri } from './uris'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export type ArweaveUploadInput = {
  imageFile: File
  name: string
  symbol: string
  description: string
  attributesJson?: string
  websiteUrl?: string
}

export type ArweaveUploadResult = {
  imageUri: string
  metadataUri: string
  estimatedCostSol: string
}

export function formatSolAmount(amount: Amount): string {
  const sol = Number(amount.basisPoints) / 1e9
  if (sol < 0.001) return '< 0.001'
  return sol.toFixed(4)
}

export async function estimateArweaveUploadCost(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  imageFile: File,
  metadataInput: Pick<NftMetadataInput, 'name' | 'symbol' | 'description'>,
  attributesJson = '',
): Promise<Amount> {
  const umi = createUmiForUpload(wallet, cluster)
  const imageGeneric = await createGenericFileFromBrowserFile(imageFile)
  const placeholderJson = buildMetadataJson({
    ...metadataInput,
    imageUrl: 'https://arweave.net/placeholder',
    attributes: parseAttributesJson(attributesJson),
  })
  const metadataGeneric = createGenericFileFromJson(
    placeholderJson,
    'metadata.json',
  )
  return umi.uploader.getUploadPrice([imageGeneric, metadataGeneric])
}

export async function uploadImageAndMetadataToArweave(
  wallet: WalletAdapter,
  cluster: SolanaCluster,
  input: ArweaveUploadInput,
  onProgress?: (message: string) => void,
): Promise<ArweaveUploadResult> {
  if (input.imageFile.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Image must be under ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`)
  }

  const umi = createUmiForUpload(wallet, cluster)
  const attributes = parseAttributesJson(input.attributesJson ?? '')

  const imageGeneric = await createGenericFileFromBrowserFile(input.imageFile)
  const metadataPlaceholder = buildMetadataJson({
    name: input.name,
    symbol: input.symbol,
    description: input.description,
    imageUrl: 'https://arweave.net/placeholder',
    attributes,
    externalUrl: input.websiteUrl,
  })
  const metadataGeneric = createGenericFileFromJson(
    metadataPlaceholder,
    'metadata.json',
  )

  const estimated = await umi.uploader.getUploadPrice([
    imageGeneric,
    metadataGeneric,
  ])

  onProgress?.('Uploading image to Arweave (approve in wallet if asked)…')
  const [imageGatewayUri] = await umi.uploader.upload([imageGeneric])
  const imageUri = toArweaveUri(imageGatewayUri)

  const metadataJson = buildMetadataJson({
    name: input.name,
    symbol: input.symbol,
    description: input.description,
    imageUrl: imageUri,
    attributes,
    externalUrl: input.websiteUrl,
  })

  onProgress?.('Uploading metadata JSON to Arweave…')
  const metadataGatewayUri = await umi.uploader.uploadJson(metadataJson)
  const metadataUri = toArweaveUri(metadataGatewayUri)

  return {
    imageUri,
    metadataUri,
    estimatedCostSol: formatSolAmount(estimated),
  }
}

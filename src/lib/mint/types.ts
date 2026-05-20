export type MintType = 'classic' | 'core' | 'cnft'

export type MintParams = {
  name: string
  uri: string
  sellerFeeBasisPoints: number
  symbol?: string
}

export type MintResult = {
  signature: string
  name: string
  mintAddress: string
  mintType: MintType
}

export type SimulationResult = {
  success: boolean
  unitsConsumed?: number
  error?: string
}

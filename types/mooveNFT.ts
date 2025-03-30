import { Address } from "viem"

export interface NFTMetadata {
  name: string
  image: string
  description: string
  attributes: {
    trait_type: string
    value: string
  }[]
}

export interface Auction {
  tokenId: bigint
  endTime: bigint
  highestBid: bigint
  highestBidder: Address
  ended: boolean
}

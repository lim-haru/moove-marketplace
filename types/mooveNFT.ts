import { Address } from "viem"

export interface NFTMetadata {
  name: string
  image: string
  description: string
}

export interface Auction {
  tokenId: bigint
  endTime: bigint
  highestBid: bigint
  highestBidder: Address
  ended: boolean
}

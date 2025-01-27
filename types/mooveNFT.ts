export interface NFTMetadata {
  name: string
  image: string
  description: string
}

export interface AuctionData {
  tokenId: bigint
  endTime: bigint
  highestBid: bigint
  highestBidder: `0x${string}`
  ended: boolean
}

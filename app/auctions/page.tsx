"use client"

import { NFTCard } from "@/components/NFTCard"
import { useReadContract } from "wagmi"
import { abi } from "@/abis/MooveNFT"

export default function AuctionsPage() {
  const auctionsIds = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "getAuctionsIds",
  })

  if (auctionsIds.status === "error") {
    console.error(auctionsIds.failureReason)
  }

  if (auctionsIds.isLoading) {
    return <p className="text-xl font-semibold text-center m-10">Loading Auctions...</p>
  }

  if (auctionsIds.isError) {
    return <p className="text-xl font-semibold text-center m-10">Failed to load Auctions</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
      {auctionsIds.isSuccess &&
        auctionsIds.data.map((tokenId, index) => <NFTCard tokenId={tokenId} isAuction={true} key={index} />)}
    </div>
  )
}

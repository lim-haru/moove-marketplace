"use client"

import { NFTCard } from "@/components/NFTCard"
import { useReadContract } from "wagmi"
import { abi } from "@/abis/MooveNFT"

export default function MarketplacePage() {
  const availableNFTs = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "getAvailableNFTs",
  })

  if (availableNFTs.status === "error") {
    console.error(availableNFTs.failureReason)
  }

  if (availableNFTs.isLoading) {
    return <p className="text-xl font-semibold text-center m-10">Loading Marketplace...</p>
  }

  if (availableNFTs.isError) {
    return <p className="text-xl font-semibold text-center m-10">Failed to load Marketplace</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
      {availableNFTs.isSuccess && availableNFTs.data.map((tokenId, index) => <NFTCard tokenId={tokenId} key={index} />)}
    </div>
  )
}

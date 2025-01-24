"use client"

import { NFTCard } from "@/components/NFTCard"
import { useReadContract } from "wagmi"
import { abi } from "@/smart-contracts/artifacts/contracts/MooveNFT.sol/MooveNFT.json"

export default function MarketplacePage() {
  const supply = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "tokenIdCounter",
  })

  if (supply.status === "error") {
    console.log(supply.failureReason)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
      {supply.isSuccess && Array.from({ length: Number(supply.data) }).map((_, index) => <NFTCard tokenId={index} key={index} />)}
    </div>
  )
}

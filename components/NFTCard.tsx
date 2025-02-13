import { useReadContract } from "wagmi"
import { abi } from "@/abis/MooveNFT"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { formatEther } from "viem"
import { getJsonFromIPFS } from "@/lib/ipfs"
import { useEffect, useState } from "react"
import Link from "next/link"
import { NFTMetadata } from "@/types/mooveNFT"

export function NFTCard({ tokenId, isAuction }: { tokenId: bigint; isAuction?: boolean }) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)

  const price = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "getPrice",
    args: [tokenId],
  })

  const tokenURI = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "tokenURI",
    args: [tokenId],
  })

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenURI.data) return

      try {
        const data = await getJsonFromIPFS(tokenURI.data as string)
        setMetadata(data)
      } catch (err) {
        console.error("Error:", err)
      }
    }

    fetchMetadata()
  }, [tokenURI.data])

  const auction = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "getAuction",
    args: isAuction ? [tokenId] : undefined,
  })

  return (
    <Link href={isAuction ? `/auctions/${tokenId}` : `/marketplace/${tokenId}`}>
      <Card className="w-[350px] md:w-[350px] lg:w-auto rounded-2xl shadow-lg">
        <CardContent className="p-0">
          {metadata?.image && (
            <Image
              src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${metadata.image}`}
              alt={metadata.name}
              width={300}
              height={250}
            />
          )}
        </CardContent>
        <CardHeader className="px-7">
          <CardTitle>{metadata?.name}</CardTitle>
        </CardHeader>
        <CardContent className="px-7 flex justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-600 font-mono">Price</span>
            <div className="font-medium">{price.data && typeof price.data === "bigint" ? formatEther(price.data) : "-"} ETH</div>
          </div>
          {isAuction && (
            <div className="flex flex-col gap-1 items-end">
              <span className="text-sm text-neutral-600 font-mono">Highest Bid</span>
              <div className="font-medium">
                {auction.data && typeof auction.data.highestBid === "bigint" ? formatEther(auction.data.highestBid) : "-"} ETH
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

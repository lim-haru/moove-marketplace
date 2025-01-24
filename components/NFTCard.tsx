import { useReadContract } from "wagmi"
import { abi } from "@/smart-contracts/artifacts/contracts/MooveNFT.sol/MooveNFT.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { formatEther } from "viem"
import { getJsonFromIPFS } from "@/lib/ipfs"
import { useEffect, useState } from "react"
import Link from "next/link"

interface NFTMetadata {
  name: string
  image: string
}

export function NFTCard({ tokenId }: { tokenId: number }) {
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

  return (
    <Link href={`/marketplace/${tokenId}`}>
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
        <CardContent className="px-7">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-600 font-mono">Price</span>
            <div className="font-medium">{price.data && typeof price.data === "bigint" ? formatEther(price.data) : null} ETH</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

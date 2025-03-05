"use client"

import { useReadContract } from "wagmi"
import { abi } from "@/abis/MooveNFT"
import Image from "next/image"
import { formatEther } from "viem"
import { getJsonFromIPFS } from "@/lib/ipfs"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Diamond, ExternalLink } from "lucide-react"
import Link from "next/link"
import MarketplaceBuyButton from "@/components/MarketplaceBuyButton"
import { NFTMetadata } from "@/types/mooveNFT"
import { usePathname } from "next/navigation"
import AuctionMakeOfferButton from "@/components/AuctionMakeOfferButton"
import Countdown from "./Coutdown"
import { shortenAddress } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function NFTDetails({ tokenId }: { tokenId: bigint }) {
  const pathname = usePathname()
  const isAuction = pathname.includes("auctions")

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

  const owner = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "ownerOf",
    args: [tokenId],
  })

  const name = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "name",
  })

  const symbol = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "symbol",
  })

  const isERC721 = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "supportsInterface",
    args: ["0x80ac58cd"],
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

  const availableNFTs = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "getAvailableNFTs",
  })

  const isSaleEnabled = availableNFTs.isSuccess && availableNFTs.data.includes(tokenId)

  const auction = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "getAuction",
    args: isAuction ? [tokenId] : undefined,
  })

  const timestamp = Date.now() / 1000
  const isAuctionEnabled = isAuction && auction.isSuccess ? timestamp < auction.data.endTime : false

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 bg-black/5 dark:bg-white/5">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                {metadata?.image ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${metadata.image}`}
                    alt={metadata.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Skeleton className="w-full h-full" />
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between">
            <Link href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${metadata?.image || ""}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on IPFS
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mt-2">
              <h1 className="text-3xl font-bold">
                {metadata?.name ? (
                  <>
                    {metadata.name} #{tokenId}
                  </>
                ) : (
                  <Skeleton className="w-[200px] h-[36px] rounded-full" />
                )}
              </h1>
              {isSaleEnabled || isAuctionEnabled ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 mr-2">
                  {isAuctionEnabled ? "On Auction" : "On Sale"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-500/10 text-red-500 mr-2">
                  Off Sale
                </Badge>
              )}
            </div>
            <div className="mt-2 text-muted-foreground">
              {metadata?.description ? metadata.description : <Skeleton className="w-full h-[20px] rounded-full" />}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-6">
              <div className="mb-4 flex justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{isAuctionEnabled ? "Current Price" : "Price"}</div>
                  <div className="flex items-center gap-2">
                    <Diamond className="h-6 w-6 text-primary" />
                    {(isAuction && auction.isSuccess) || (!isAuction && price.isSuccess) ? (
                      <span className="text-3xl font-bold">
                        {isAuction ? formatEther(auction.data!.highestBid) : formatEther(price.data!)} ETH
                      </span>
                    ) : (
                      <Skeleton className="w-[130px] h-[36px] rounded-full bg-gray-200" />
                    )}
                  </div>
                </div>
                {isAuction && (
                  <div>
                    <div className="text-sm text-muted-foreground pl-1">Auction ends</div>
                    {auction.isSuccess ? (
                      <Countdown targetTimestamp={auction.data.endTime} size="large" />
                    ) : (
                      <Skeleton className="w-[230px] h-[56px] rounded-full bg-gray-200" />
                    )}
                  </div>
                )}
              </div>
              {tokenId.toString() &&
                price.isSuccess &&
                (isAuction && auction.isSuccess ? (
                  <AuctionMakeOfferButton
                    tokenId={tokenId}
                    currentPrice={auction.data.highestBid}
                    isAuctionEnabled={isAuctionEnabled}
                  />
                ) : (
                  <MarketplaceBuyButton tokenId={tokenId} price={price.data} isSaleEnabled={isSaleEnabled} />
                ))}
            </div>

            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Owner</TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm">
                      {owner.isSuccess ? (
                        <span className="font-mono text-sm">{shortenAddress(owner.data)}</span>
                      ) : (
                        <Skeleton className="w-[120px] h-[20px] rounded-full justify-self-end" />
                      )}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Token ID</TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm">#{tokenId}</span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Collection</TableCell>
                  <TableCell className="text-right">
                    {name.isSuccess ? name.data : <Skeleton className="w-[100px] h-[20px] rounded-full justify-self-end" />}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Symbol</TableCell>
                  <TableCell className="text-right">
                    {symbol.isSuccess ? symbol.data : <Skeleton className="w-[50px] h-[20px] rounded-full justify-self-end" />}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Token Standard</TableCell>
                  <TableCell className="text-right">
                    {isERC721.isSuccess ? (
                      isERC721.data ? (
                        "ERC721"
                      ) : (
                        "Unknown"
                      )
                    ) : (
                      <Skeleton className="w-[60px] h-[20px] rounded-full justify-self-end" />
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

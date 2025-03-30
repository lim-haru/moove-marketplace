"use client"

import { useEffect, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { Address, formatEther, parseAbiItem } from "viem"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Diamond } from "lucide-react"
import Image from "next/image"
import { shortenAddress } from "@/lib/utils"
import { abi } from "@/abis/MooveNFT"
import { getJsonFromIPFS } from "@/lib/ipfs"
import { getExplorerUrl } from "@/lib/explorers"
import Link from "next/link"
import Countdown from "@/components/Coutdown"
import { Auction, NFTMetadata } from "@/types/mooveNFT"
import { Skeleton } from "@/components/ui/skeleton"

interface PurchaseEvent {
  address: Address
  args: {
    tokenId?: bigint
    owner?: Address
    price?: bigint
  }
  date: string
  image: string
  name: string
  txLink: string
}

interface BidEvent {
  args: {
    tokenId?: bigint
    bidder?: Address
    bid?: bigint
  }
  auction: Auction
  image: string
  name: string
  txLink: string
}

async function fetchMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  try {
    const metadata = await getJsonFromIPFS(tokenURI)
    return metadata
  } catch (error) {
    console.error("Error in the Metadata fetch:", error)
    return null
  }
}

export default function HistoryPage() {
  const publicClient = usePublicClient()
  const { address, isConnected } = useAccount()
  const [purchaseEvents, setPurchaseEvents] = useState<PurchaseEvent[]>([])
  const [bidEvents, setBidEvents] = useState<BidEvent[]>([])

  useEffect(() => {
    if (!publicClient || !address) return

    const fetchPurchaseEvents = async () => {
      try {
        const logs = await publicClient.getLogs({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          event: parseAbiItem("event BoughtNFT(address indexed owner, uint256 indexed tokenId, uint256 price)"),
          args: { owner: address },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })

        const logsWithDetails = await Promise.all(
          logs.map(async (log) => {
            // Get block timestamp and format it as a readable date
            const { timestamp } = await publicClient.getBlock({ blockNumber: log.blockNumber })
            const date = new Date(Number(timestamp) * 1000).toISOString().slice(0, 16).replace("T", " ")
            const tokenId = log.args.tokenId!

            const tokenURI = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
              abi,
              functionName: "tokenURI",
              args: [tokenId],
            })

            const metadata = await fetchMetadata(tokenURI)

            // Get the transaction explorer link
            const chainId = publicClient.chain.id
            const txLink = `${getExplorerUrl(chainId)}${log.transactionHash}`

            return {
              ...log,
              date,
              image: metadata?.image ?? "",
              name: metadata?.name ?? "",
              txLink,
            }
          })
        )

        setPurchaseEvents(logsWithDetails)
      } catch (error) {
        console.error("Error fetching purchase events:", error)
      }
    }

    const fetchBidEvents = async () => {
      try {
        const logs = await publicClient.getLogs({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          event: parseAbiItem("event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 bid)"),
          args: { bidder: address },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })

        const logsWithDetails = await Promise.all(
          logs.map(async (log) => {
            const tokenId = log.args.tokenId!

            const tokenURI = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
              abi,
              functionName: "tokenURI",
              args: [tokenId],
            })

            const auction = await publicClient.readContract({
              abi,
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
              functionName: "getAuction",
              args: [tokenId],
            })

            const metadata = await fetchMetadata(tokenURI)

            // Get the transaction explorer link
            const chainId = publicClient.chain.id
            const txLink = `${getExplorerUrl(chainId)}${log.transactionHash}`

            return {
              ...log,
              auction,
              image: metadata?.image ?? "",
              name: metadata?.name ?? "",
              txLink,
            }
          })
        )

        setBidEvents(logsWithDetails)
      } catch (error) {
        console.error("Error fetching bid events:", error)
      }
    }

    fetchPurchaseEvents()
    fetchBidEvents()
  }, [address, isConnected, publicClient])

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="purchases" className="space-y-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">Track your NFT purchases and offers</p>
          </div>
          <TabsList>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            {purchaseEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseEvents.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                            {event.image ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${event.image}`}
                                alt={event.name || "NFT"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Skeleton className="w-[48px] h-[48px] rounded-lg" />
                            )}
                          </div>
                          <div className="font-medium">
                            {event.name ? (
                              `${event.name} #${event.args.tokenId}`
                            ) : (
                              <Skeleton className="w-[150px] h-[20px] rounded-full" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Diamond className="h-4 w-4" />
                          {event.args.price ? (
                            <span>{formatEther(event.args.price)} ETH</span>
                          ) : (
                            <Skeleton className="w-[35px] h-[20px] rounded-full" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{shortenAddress(event.address)}</span>
                      </TableCell>
                      <TableCell>
                        {event.args.owner ? (
                          <span className="font-mono text-sm">{shortenAddress(event.args.owner)}</span>
                        ) : (
                          <Skeleton className="w-[120px] h-[20px] rounded-full" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{event.date}</div>
                      </TableCell>
                      <TableCell>
                        <Link href={event.txLink} target="_blank">
                          <Button variant="ghost" size="sm">
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-6">No purchase transactions found.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            {bidEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Offer Amount</TableHead>
                    <TableHead>Highest Bid</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bidEvents.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                            {event.image ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${event.image}`}
                                alt={event.name || "NFT"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Skeleton className="w-[48px] h-[48px] rounded-lg" />
                            )}
                          </div>
                          <div className="font-medium">
                            {event.name ? (
                              `${event.name} #${event.args.tokenId}`
                            ) : (
                              <Skeleton className="w-[150px] h-[20px] rounded-full" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Diamond className="h-4 w-4" />
                          {event.args.bid ? (
                            <span>{formatEther(event.args.bid)} ETH</span>
                          ) : (
                            <Skeleton className="w-[35px] h-[20px] rounded-full" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Diamond className="h-4 w-4" />
                          {event.auction.highestBid ? (
                            <span>{formatEther(event.auction.highestBid)} ETH</span>
                          ) : (
                            <Skeleton className="w-[35px] h-[20px] rounded-full" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="justify-items-start">
                        {event.auction.endTime ? (
                          <Countdown targetTimestamp={event.auction.endTime} size="small" />
                        ) : (
                          <Skeleton className="w-[115px] h-[36px] rounded-full" />
                        )}
                      </TableCell>
                      <TableCell>
                        {event.auction.endTime ? (
                          <Badge variant="secondary">{Date.now() / 1000 < event.auction.endTime ? "Active" : "Ended"}</Badge>
                        ) : (
                          <Skeleton className="w-[60px] h-[22px] rounded-full" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={event.txLink} target="_blank">
                          <Button variant="ghost" size="sm">
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-6">No bid transactions found.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

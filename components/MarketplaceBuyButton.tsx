import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { abi } from "@/abis/MooveNFT"

interface MarketplaceBuyButtonProps {
  tokenId: bigint
  price: bigint
  isSaleEnabled: boolean
}
export default function MarketplaceBuyButton({ tokenId, price, isSaleEnabled }: MarketplaceBuyButtonProps) {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { writeContract } = useWriteContract()

  function buyNFT() {
    writeContract({
      abi,
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "buyNFT",
      args: [tokenId],
      value: price,
    })
  }

  return (
    <Button disabled={!isSaleEnabled} className="w-full" size="lg" onClick={isConnected ? () => buyNFT() : () => open()}>
      {isConnected ? "Buy Now" : "Connect Wallet"}
    </Button>
  )
}

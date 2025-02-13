import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { abi } from "@/smart-contracts/artifacts/contracts/MooveNFT.sol/MooveNFT.json"

interface MarketplaceBuyButtonProps {
  tokenId: bigint
  price: bigint
  owner: string
}
export default function MarketplaceBuyButton({ tokenId, price, owner }: MarketplaceBuyButtonProps) {
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
    <Button
      disabled={owner != process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
      className="w-full"
      size="lg"
      onClick={isConnected ? () => buyNFT() : () => open()}
    >
      {isConnected ? "Buy Now" : "Connect Wallet"}
    </Button>
  )
}

import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { abi } from "@/smart-contracts/artifacts/contracts/MooveNFT.sol/MooveNFT.json"

interface NFTButtonProps {
  tokenId: string
  price: bigint
  owner: string
}
export default function BuyNFTButton({ tokenId, price, owner }: NFTButtonProps) {
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
    <>
      {owner === process.env.NEXT_PUBLIC_CONTRACT_ADDRESS && (
        <Button className="w-full" size="lg" onClick={isConnected ? () => buyNFT() : () => open()}>
          {isConnected ? "Buy Now" : "Connect Wallet"}
        </Button>
      )}
    </>
  )
}

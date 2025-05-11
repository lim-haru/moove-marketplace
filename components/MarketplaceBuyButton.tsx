import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Button } from "@/components/ui/button"
import { abi } from "@/abis/MooveNFT"
import { LoaderCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface IProps {
  tokenId: bigint
  price: bigint
  isSaleEnabled: boolean
  onBuySuccess?: () => void
}
export default function MarketplaceBuyButton({ tokenId, price, isSaleEnabled, onBuySuccess }: IProps) {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { toast } = useToast()

  const {
    isLoading,
    isSuccess,
    isError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  function buyNFT() {
    writeContract({
      abi,
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "buyNFT",
      args: [tokenId],
      value: price,
    })
  }

  useEffect(() => {
    if (isLoading) {
      toast({
        title: "Transaction in confirmation ...",
      })
    }
  }, [isLoading, toast])

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Transaction Completed",
        description: `You successfully purchased the NFT #${tokenId}`,
      })
      // Update the state of the NFT sale, without reloading the page
      if (onBuySuccess) {
        onBuySuccess()
      }
    }
  }, [isSuccess, toast, tokenId, onBuySuccess])

  useEffect(() => {
    if (isError) {
      toast({
        title: "Transaction Failed",
        description: receiptError.message || "A mistake has occurred while buying the NFT",
        variant: "destructive",
      })
    }
  }, [isError, receiptError, toast])

  let buttonContent
  if (!isConnected) {
    buttonContent = "Connect Wallet"
  } else if (isPending || isLoading) {
    buttonContent = <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
  } else {
    buttonContent = "Buy Now"
  }

  return (
    <Button
      disabled={!isSaleEnabled || isPending || isLoading}
      className="w-full"
      size="lg"
      onClick={isConnected ? () => buyNFT() : () => open()}
    >
      {buttonContent}
    </Button>
  )
}

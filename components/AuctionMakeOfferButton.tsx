import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Button } from "@/components/ui/button"
import { abi } from "@/abis/MooveNFT"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { parseUnits } from "ethers"
import { placeBidSchema, PlaceBidSchemaType } from "@/schemas/auction"
import { LoaderCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface IProps {
  tokenId: bigint
  currentPrice: bigint
  isAuctionEnabled: boolean
  onBidPlaced?: (newBid: bigint) => void
}
export default function AuctionMakeOfferButton({ tokenId, currentPrice, isAuctionEnabled, onBidPlaced }: IProps) {
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

  const form = useForm<PlaceBidSchemaType>({
    resolver: zodResolver(placeBidSchema(currentPrice)),
    defaultValues: {
      bid: 0,
    },
  })

  function onSubmit(values: PlaceBidSchemaType) {
    const bidWei = parseUnits(values.bid.toString(), "ether")

    if (isConnected && bidWei > currentPrice) {
      writeContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "placeBid",
        args: [tokenId],
        value: bidWei,
      })
    } else {
      open()
    }
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
        description: `You successfully placed an offer for NFT #${tokenId}`,
      })
      // Update only the price, without recharging the page
      if (form.getValues("bid") && onBidPlaced) {
        const newBid = parseUnits(form.getValues("bid").toString(), "ether")
        onBidPlaced(newBid)
      }
      form.reset()
    }
  }, [isSuccess, toast, tokenId, onBidPlaced, form])

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
    buttonContent = "Place Bid"
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex place-items-top my-3">
        <FormField
          control={form.control}
          name="bid"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl className="h-full">
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="Enter your bid"
                  className="px-4 py-2 focus-visible:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={!isAuctionEnabled}
                />
              </FormControl>
              <FormMessage className="absolute ml-2" />
            </FormItem>
          )}
        />

        <Button
          disabled={!isAuctionEnabled || isPending || isLoading}
          type="submit"
          variant="outline"
          className="w-full"
          size="lg"
        >
          {buttonContent}
        </Button>
      </form>
    </Form>
  )
}

import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { abi } from "@/abis/MooveNFT"
import { useTransition } from "react"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { parseUnits, formatUnits } from "ethers"

interface AuctionMakeOfferButtonProps {
  tokenId: bigint
  currentPrice: bigint
  isAuctionEnabled: boolean
}
export default function AuctionMakeOfferButton({ tokenId, currentPrice, isAuctionEnabled }: AuctionMakeOfferButtonProps) {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { writeContract } = useWriteContract()

  const [isPending, startTransition] = useTransition()

  const placeBidSchema = z.object({
    bid: z.coerce.number().gt(Number(formatUnits(currentPrice, "ether")), "Your bid must be higher than the current price"),
  })

  const form = useForm<z.infer<typeof placeBidSchema>>({
    resolver: zodResolver(placeBidSchema),
    defaultValues: {
      bid: 0,
    },
  })

  function onSubmit(values: z.infer<typeof placeBidSchema>) {
    const bidWei = parseUnits(values.bid.toString(), "ether")

    startTransition(async () => {
      if (isConnected && bidWei > currentPrice) {
        try {
          writeContract(
            {
              abi,
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
              functionName: "placeBid",
              args: [tokenId],
              value: bidWei,
            },
            {
              onError: (err) => {
                console.error(err)
              },
              onSuccess: () => {
                form.reset()
              },
            }
          )
        } catch (err) {
          console.error(err)
        }
      } else {
        open()
      }
    })
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

        <Button disabled={isPending || !isAuctionEnabled} type="submit" variant="outline" className="w-full" size="lg">
          {isConnected ? "Place bid" : "Connect Wallet"}
        </Button>
      </form>
    </Form>
  )
}

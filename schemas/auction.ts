import { z } from "zod"
import { formatUnits } from "ethers"

export const placeBidSchema = (currentPrice: bigint) =>
  z.object({
    bid: z.coerce.number().gt(Number(formatUnits(currentPrice, "ether")), "Your bid must be higher than the current price"),
  })

export type PlaceBidSchemaType = z.infer<ReturnType<typeof placeBidSchema>>

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Address } from "viem"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: Address) {
  if (!address || address.length < 10) return address
  return address.slice(0, 6) + "..." + address.slice(-4)
}

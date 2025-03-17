"use client"

import { wagmiAdapter, projectId } from "@/config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
import { sepolia, holesky } from "@reown/appkit/networks"
import React, { type ReactNode } from "react"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"
import { defineChain } from "@reown/appkit/networks"

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error("Project ID is not defined")
}

const metadata = {
  name: "appkit-moove",
  description: "AppKit Moove",
  url: "",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
}

const isDevelopment = process.env.NODE_ENV === "development"

const customNetwork = isDevelopment
  ? defineChain({
      id: 31337,
      caipNetworkId: "eip155:31337",
      chainNamespace: "eip155",
      name: "Hardhat",
      nativeCurrency: {
        decimals: 18,
        name: "Hardhat Ether",
        symbol: "hETH",
      },
      rpcUrls: {
        default: {
          http: ["http://127.0.0.1:8545"],
          webSocket: ["ws://127.0.0.1:8545"],
        },
      },
      blockExplorers: {
        default: { name: "Explorer", url: "BLOCK_EXPLORER_URL" },
      },
      contracts: {},
    })
  : null

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia, holesky, ...(customNetwork ? [customNetwork] : [])],
  defaultNetwork: sepolia,
  metadata: metadata,
  features: {
    email: true,
    socials: ["google", "x", "discord"],
    emailShowWallets: true,
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-border-radius-master": "2px",
    "--w3m-accent": "#111827",
    "--w3m-color-mix-strength": 5,
  },
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider

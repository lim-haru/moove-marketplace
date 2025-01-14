import { cookieStorage, createStorage } from "@wagmi/core"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { mainnet, arbitrum } from "@reown/appkit/networks"
import { defineChain } from "@reown/appkit/networks"

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error("Project ID is not defined")
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
      contracts: {
        // Add the contracts here
      },
    })
  : null

export const networks = [mainnet, arbitrum, ...(customNetwork ? [customNetwork] : [])]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
})

export const config = wagmiAdapter.wagmiConfig

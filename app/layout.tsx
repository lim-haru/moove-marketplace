import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

import { headers } from "next/headers"
import ContextProvider from "@/context"

import Navbar from "@/components/Navbar"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Moove Marketplace | NFT for Shared Mobility",
  description:
    "Decentralized platform based on Ethereum blockchain for buying, selling, and managing NFTs related to shared mobility.",
  keywords: "NFT, blockchain, Ethereum, shared mobility, marketplace, auctions, token, decentralized",
  authors: [{ name: "lim-haru" }],
  creator: "lim-haru",
  publisher: "Vercel",
  openGraph: {
    title: "Moove Marketplace | NFT for Shared Mobility",
    description: "Decentralized platform for NFTs related to shared mobility on Ethereum blockchain",
    url: "/marketplace",
    siteName: "Moove Marketplace",
    images: [
      {
        url: "/moove-logo.svg",
        width: 800,
        height: 600,
        alt: "Moove Marketplace Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moove Marketplace | NFT for Shared Mobility",
    description: "Decentralized platform for NFTs related to shared mobility on Ethereum blockchain",
    images: ["/moove-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookies = (await headers()).get("cookie")

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ContextProvider cookies={cookies}>
          <Navbar />
          <div className="mx-auto max-w-screen-xl flex flex-col px-8 xl:px-0 py-8">
            <div className="flex-grow">{children}</div>
          </div>
        </ContextProvider>
      </body>
    </html>
  )
}

"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false)

  const links = [
    { path: "/marketplace", name: "Marketplace" },
    { path: "/auctions", name: "Auctions " },
    { path: "/history", name: "History" },
  ]

  return (
    <nav className="bg-white fixed w-full z-20 top-0 start-0 border-b border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href={links[0].path}>
          <Image src="moove-logo.svg" width={85} height={31.8} alt="Moove Logo" />
        </Link>
        <div className="flex space-x-3 md:space-x-0 md:order-2 items-center">
          <appkit-button />
          <div className="flex md:hidden">
            <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="link" size="icon">
                  <Menu />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={16} className="!w-svw">
                {links.map(({ path, name }, index) => (
                  <DropdownMenuItem key={index}>
                    <Link
                      href={path}
                      className="text-gray-900 hover:text-blue-700 p-0 text-base font-semibold"
                      onClick={() => {
                        setOpenMenu(false)
                      }}
                    >
                      {name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="hidden md:flex w-auto items-center justify-between" id="navbar-sticky">
          <ul className="hidden md:flex flex-row font-medium space-x-8">
            {links.map(({ path, name }, index) => (
              <li key={index}>
                <Link href={path} className="text-gray-900 hover:text-blue-700 p-0">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

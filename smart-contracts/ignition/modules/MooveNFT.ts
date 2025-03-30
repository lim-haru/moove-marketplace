import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const MooveNFTModule = buildModule("MooveNFTModule", (m) => {
  const mooveNFT = m.contract("MooveNFT")

  return { mooveNFT }
})

export default MooveNFTModule

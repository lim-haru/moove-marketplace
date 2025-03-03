import { expect } from "chai"
import hre from "hardhat"
import { parseUnits } from "ethers"
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers"

describe("MooveNFT", function () {
  async function deploy() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners()
    const tokenURI = "ipfs://uri-example/1.json"
    const ONE_DAY_IN_SECS = 86400

    const mooveNFT = await hre.ethers.deployContract("MooveNFT")

    return { mooveNFT, owner, addr1, addr2, tokenURI, ONE_DAY_IN_SECS }
  }

  async function createNFT() {
    const { mooveNFT, tokenURI } = await loadFixture(deploy)

    const tx = await mooveNFT.createNFT(tokenURI, parseUnits("0.0001", "ether"))

    const receipt = await tx.wait()
    const event = mooveNFT.interface.parseLog(receipt!.logs[1])
    const tokenId = event!.args[0]

    return tokenId
  }

  it("Should create a new NFT", async function () {
    const { mooveNFT } = await loadFixture(deploy)

    const tokenId = await createNFT()

    expect(await mooveNFT.ownerOf(tokenId)).to.equal(await mooveNFT.getAddress())
  })

  it("Should allow the purchase of an NFT", async function () {
    const { mooveNFT, addr1 } = await loadFixture(deploy)

    const tokenId = await createNFT()

    await mooveNFT.connect(addr1).buyNFT(tokenId, { value: parseUnits("0.0001", "ether") })

    expect(await mooveNFT.ownerOf(tokenId)).to.equal(addr1.address)
  })

  it("Should create an auction", async function () {
    const { mooveNFT, ONE_DAY_IN_SECS } = await loadFixture(deploy)

    const tokenId = await createNFT()

    await mooveNFT.createAuction(tokenId, ONE_DAY_IN_SECS, parseUnits("0.00001", "ether"))

    const auction = await mooveNFT.getAuction(0)
    expect(auction.tokenId).to.equal(tokenId)

    const unlockTime = (await time.latest()) + ONE_DAY_IN_SECS
    expect(auction.endTime).to.equal(unlockTime)
  })

  it("Should allow you to place offers", async function () {
    const { mooveNFT, ONE_DAY_IN_SECS, addr1 } = await loadFixture(deploy)

    const tokenId = await createNFT()

    await mooveNFT.createAuction(tokenId, ONE_DAY_IN_SECS, parseUnits("0.00001", "ether"))
    const bid = parseUnits("0.00005", "ether")
    await mooveNFT.connect(addr1).placeBid(tokenId, { value: bid })

    const auction = await mooveNFT.getAuction(0)
    expect(auction.highestBid).to.equal(bid)
  })

  it("Should allow the auction to conclude", async function () {
    const { mooveNFT, ONE_DAY_IN_SECS, addr1 } = await loadFixture(deploy)

    const tokenId = await createNFT()

    await mooveNFT.createAuction(tokenId, ONE_DAY_IN_SECS, parseUnits("0.00001", "ether"))
    const bid = parseUnits("0.00005", "ether")
    await mooveNFT.connect(addr1).placeBid(tokenId, { value: bid })

    const unlockTime = (await time.latest()) + ONE_DAY_IN_SECS
    await time.increaseTo(unlockTime)
    await mooveNFT.connect(addr1).endAuction(tokenId)

    expect(await mooveNFT.ownerOf(tokenId)).to.equal(addr1.address)
  })
})

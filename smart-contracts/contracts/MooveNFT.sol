// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MooveNFT is ERC721URIStorage, Ownable, ERC721Holder {
  uint256 public constant MAX_AUCTION_DURATION = 30 days;

  uint256 private tokenIdCounter;

  mapping(uint256 => uint256) private tokenPrices;

  uint256[] private auctionsIds;
  struct Auction {
    uint256 tokenId;
    uint256 endTime;
    uint256 highestBid;
    address payable highestBidder;
    bool ended;
  }

  mapping(uint256 => Auction) private auctions;

  event NFTCreated(uint256 tokenId, address owner);
  event NFTTransferred(uint256 tokenId, address from, address to);
  event BuyedNFT(address indexed owner, uint256 indexed id);
  event AuctionCreated(uint256 tokenId, uint256 endTime);
  event BidPlaced(uint256 tokenId, address bidder, uint256 bid);
  event AuctionEnded(uint256 tokenId, address winner, uint256 amount);

  constructor() ERC721("MooveNFT", "MVE") Ownable(msg.sender) {}

  function createNFT(string memory _tokenURI, uint256 price) public onlyOwner {
    _safeMint(address(this), tokenIdCounter);
    _setTokenURI(tokenIdCounter, _tokenURI);

    tokenPrices[tokenIdCounter] = price;
    tokenIdCounter++;

    emit NFTCreated(tokenIdCounter, msg.sender);
  }

  function changePrice(uint256 _tokenId, uint256 price) public onlyOwner {
    require(_tokenId <= tokenIdCounter, "The NFT does not exist");

    tokenPrices[_tokenId] = price;
  }

  function buyNFT(uint256 _tokenId) public payable {
    require(_tokenId <= tokenIdCounter, "The NFT does not exist");
    require(msg.value >= tokenPrices[_tokenId], "Insufficient funds");

    Auction storage auction = auctions[_tokenId];
    require(auction.endTime == 0 || block.timestamp >= auction.endTime, "NFT is currently in auction");

    _transfer(address(this), msg.sender, _tokenId);

    emit BuyedNFT(msg.sender, _tokenId);
  }

  function createAuction(uint256 _tokenId, uint256 duration, uint256 startingPrice) external onlyOwner {
    require(_tokenId <= tokenIdCounter, "The NFT does not exist");
    require(auctions[_tokenId].endTime == 0 || auctions[_tokenId].ended, "NFT is already in auction");
    require(duration <= MAX_AUCTION_DURATION, "Auction duration exceeds maximum limit");

    auctions[_tokenId] = Auction({
      tokenId: _tokenId,
      endTime: block.timestamp + duration,
      highestBid: startingPrice,
      highestBidder: payable(address(0)),
      ended: false
    });
    auctionsIds.push(_tokenId);

    emit AuctionCreated(_tokenId, block.timestamp + duration);
  }

  function placeBid(uint256 _tokenId) external payable {
    Auction storage auction = auctions[_tokenId];
    require(block.timestamp < auction.endTime, "Auction ended");
    require(msg.value > auction.highestBid, "Bid too low");

    if (auction.highestBidder != address(0)) {
      auction.highestBidder.transfer(auction.highestBid);
    }

    auction.highestBid = msg.value;
    auction.highestBidder = payable(msg.sender);

    emit BidPlaced(_tokenId, msg.sender, msg.value);
  }

  function endAuction(uint256 _tokenId) external {
    Auction storage auction = auctions[_tokenId];
    require(block.timestamp >= auction.endTime, "Auction not ended");
    require(!auction.ended, "Auction already ended");

    auction.ended = true;
    if (auction.highestBidder != address(0)) {
      _transfer(address(this), auction.highestBidder, _tokenId);
    }

    emit AuctionEnded(_tokenId, auction.highestBidder, auction.highestBid);
  }

  function getPrice(uint256 _tokenId) public view returns (uint256) {
    return tokenPrices[_tokenId];
  }

  function getNFTSupply() public view returns (uint256) {
    return tokenIdCounter;
  }

  function getAuctionsIds() public view returns (uint256[] memory) {
    return auctionsIds;
  }

  function getAuction(uint256 _tokenId) public view returns (Auction memory) {
    return auctions[_tokenId];
  }

  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    payable(owner()).transfer(balance);
  }
}

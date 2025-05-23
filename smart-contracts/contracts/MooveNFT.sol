// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MooveNFT is ERC721URIStorage, Ownable, ERC721Holder {
  uint256 public constant MAX_AUCTION_DURATION = 30 days;

  uint256 private tokenIdCounter;

  mapping(uint256 => uint256) private tokenPrices;

  uint256[] private availableNFTList;
  uint256[] private auctionsIds;

  struct Auction {
    uint256 tokenId;
    uint256 endTime;
    uint256 highestBid;
    address payable highestBidder;
    bool ended;
  }

  mapping(uint256 => Auction) private auctions;

  event NFTCreated(uint256 indexed tokenId, address indexed owner);
  event BoughtNFT(address indexed owner, uint256 indexed tokenId, uint256 price);
  event NFTAuctionCreated(uint256 indexed tokenId, uint256 endTime);
  event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 bid);
  event NFTAuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount);

  constructor() ERC721("MooveNFT", "MVE") Ownable(msg.sender) {}

  function _removeFromAvailableList(uint256 _tokenId) private {
    for (uint256 i = 0; i < availableNFTList.length; i++) {
      if (availableNFTList[i] == _tokenId) {
        availableNFTList[i] = availableNFTList[availableNFTList.length - 1];
        availableNFTList.pop();
        return;
      }
    }
  }

  function createNFT(string memory _tokenURI, uint256 price) public onlyOwner {
    _safeMint(address(this), tokenIdCounter);
    _setTokenURI(tokenIdCounter, _tokenURI);

    tokenPrices[tokenIdCounter] = price;
    availableNFTList.push(tokenIdCounter);

    emit NFTCreated(tokenIdCounter, msg.sender);

    tokenIdCounter++;
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

    uint256 price = tokenPrices[_tokenId];
    uint256 refund = msg.value - price;

    _transfer(address(this), msg.sender, _tokenId);
    _removeFromAvailableList(_tokenId);

    // Refund excess payment if any
    if (refund > 0) {
      payable(msg.sender).transfer(refund);
    }

    emit BoughtNFT(msg.sender, _tokenId, price);
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

    _removeFromAvailableList(_tokenId);

    emit NFTAuctionCreated(_tokenId, block.timestamp + duration);
  }

  function placeBid(uint256 _tokenId) external payable {
    Auction storage auction = auctions[_tokenId];
    require(block.timestamp < auction.endTime, "Auction ended");
    require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");

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
      emit NFTAuctionEnded(_tokenId, auction.highestBidder, auction.highestBid);
    } else {
      emit NFTAuctionEnded(_tokenId, address(0), 0);
    }

    // Remove _tokenId from auctionIds
    for (uint256 i = 0; i < auctionsIds.length; i++) {
      if (auctionsIds[i] == _tokenId) {
        auctionsIds[i] = auctionsIds[auctionsIds.length - 1];
        auctionsIds.pop();
        break;
      }
    }

    delete auctions[_tokenId];
  }

  function getPrice(uint256 _tokenId) public view returns (uint256) {
    return tokenPrices[_tokenId];
  }

  function getNFTSupply() public view returns (uint256) {
    return tokenIdCounter;
  }

  function getAvailableNFTs() public view returns (uint256[] memory) {
    return availableNFTList;
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

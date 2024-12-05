// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MooveNFT is ERC721URIStorage, Ownable {
  uint256 public tokenIdCounter;

  mapping(uint256 => uint256) public tokenPrices;

  event NFTCreated(uint256 tokenId, address owner);
  event BuyedNFT(address indexed owner, uint256 indexed id);

  constructor() ERC721("MooveNFT", "MVE") Ownable(msg.sender) {}

  function createNFT(string memory _tokenURI, uint256 price) public onlyOwner {
    _safeMint(owner(), tokenIdCounter);
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

    super.transferFrom(owner(), msg.sender, _tokenId);
    emit BuyedNFT(msg.sender, _tokenId);
  }

  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    payable(owner()).transfer(balance);
  }
}

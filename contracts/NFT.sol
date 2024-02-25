// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint public mintPrice;
    uint private nextTokenId;
    mapping(uint256 => address) private _tokenOwners;

    bool public isPublicMintEnabled;
    mapping(address => uint) public walletMints;
    uint256 public totalsupply;

    constructor(
        string memory _name,
        string memory _symbol,
        uint _mintPrice
    ) payable ERC721(_name, _symbol) Ownable(msg.sender) {
        mintPrice = _mintPrice;
        totalsupply = 0;
    }

    function setIsPublicMintEnabled(
        bool _isPublicMintEnabled
    ) external onlyOwner {
        isPublicMintEnabled = _isPublicMintEnabled;
    }

    function withdraw(address _address) external onlyOwner {
        (bool success, ) = payable(_address).call{value: address(this).balance}(
            ""
        );
        require(success, "Withdraw failed");
    }
    function Price() public returns (uint256) {
        if (totalsupply == 0) {
            return 100000000000000; // Base price for the first token
        }

        mintPrice = (1000000000000000000 * totalsupply * totalsupply) / 8000; // Calculate price based on the formula
        return mintPrice;
    }

    function mint(string calldata _uri) public payable {
        // require(isPublicMintEnabled, "Public minting not enabled");
        require(msg.value == mintPrice, "Wrong mint value");
        uint newTokenId = _getNextTokenId();
        walletMints[msg.sender]++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _uri);
        totalsupply++;
        Price();
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _getNextTokenId() private returns (uint256) {
        nextTokenId++;
        return nextTokenId;
    }

    function burn() external payable {
        // require(nextTokenId > 0, "No tokens to burn");
        uint256 lastTokenId = _getLastTokenId(msg.sender);
        //require(lastTokenId != 0, "You don't own any tokens");
        totalsupply--;
        Price(); // Update the price

        _burn(lastTokenId);

        uint256 currentPrice = mintPrice; // Capture the updated price

        // Transfer the updated price
        payable(msg.sender).transfer(currentPrice);
    }

    function _getLastTokenId(address owner) private view returns (uint256) {
        uint ownerTokens = balanceOf(owner) - 1;
        // for (uint256 i = nextTokenId; i >= 0; i--) {
        //     if (_tokenOwners[i] == owner) {
        //         return i;
        //     }
        // }
        uint lastTokenId = tokenOfOwnerByIndex(owner, ownerTokens);
        return lastTokenId;
    }
}

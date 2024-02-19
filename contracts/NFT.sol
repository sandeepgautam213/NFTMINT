// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint public mintPrice;

    bool public isPublicMintEnabled;
    mapping(address => uint) public walletMints;

    constructor(
        string memory _name,
        string memory _symbol,
        uint _mintPrice
    ) payable ERC721(_name, _symbol) Ownable(msg.sender) {
        mintPrice = _mintPrice;
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

    function mint(string calldata _uri) public payable {
        require(isPublicMintEnabled, "Public minting not enabled");
        require(msg.value == mintPrice, "Wrong mint value");

        uint newTokenId = totalSupply();
        walletMints[msg.sender]++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _uri);
    }

    // required overrides
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
}

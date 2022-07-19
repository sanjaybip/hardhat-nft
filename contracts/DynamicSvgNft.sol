// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    //contract variables
    uint256 public s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    mapping(uint256 => int256) private s_tokenIdToValues;
    AggregatorV3Interface internal immutable i_priceFeed;

    //events
    event DynamicNFTCreated(uint256 indexed tokenId, int256 value);

    constructor(
        address priceFeedAddress,
        string memory lowImageSvg,
        string memory highImageSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_tokenCounter = 0;
        s_lowImageURI = svgToImageURI(lowImageSvg);
        s_highImageURI = svgToImageURI(highImageSvg);
    }

    function svgToImageURI(string memory svgFile)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svgFile)))
        );
        return
            string(
                abi.encodePacked("data:image/svg+xml;base64,", svgBase64Encoded)
            );
    }

    function mintNFT(int256 value) public {
        s_tokenIdToValues[s_tokenCounter] = value;
        _safeMint(msg.sender, s_tokenCounter);
        emit DynamicNFTCreated(s_tokenCounter, value);
        s_tokenCounter = s_tokenCounter + 1;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        // If tokenId does not exist then only we generate TokenURI, else revert with error.
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        //get price feed
        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = s_lowImageURI;
        if (price >= s_tokenIdToValues[tokenId]) {
            imageURI = s_highImageURI;
        }
        // name() is part of ERC721 interface
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], ',
                                '"image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    //pure/view function

    function gettokenIdToValues(uint256 index) public view returns (int256) {
        return s_tokenIdToValues[index];
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageURI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}

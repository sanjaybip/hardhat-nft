// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//errors
error RandomIpfsNft_RangeOutOfBounds();
error NeedMoreETHSent();
error RandomIpfsNft_AlreadyInitialized();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // when we will Mint NTF, we will trigger chainlink VRF call to get a random number
    // using that number, we will get a random NFT (The random NFT we will use Pug, Shib Inu, St. Bernard)
    // Pug will be rare, Shib Inu will be somewhat rare, St. Bernard is not rare
    //user have to pay ETH to mint
    // owner can withdraw the ETH amount
    /**______________________________________________ */

    //Type declartion
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    //chain link variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    // Chinalink VRF helper
    mapping(uint256 => address) public s_requesIdToSender;
    uint256 internal constant MAX_CHANCE_VALUE = 100;

    // NFT variables
    uint256 public s_tokenCounter;
    string[] internal s_dogTokenUris;
    uint256 internal immutable i_mintFee;
    bool private s_initialized;

    //Events
    event NftRequested(uint256 indexed requestId, address requesterAddress);
    event NftMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, /*keyHash*/
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        //setting chainlink VRF
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        i_mintFee = mintFee;
        _initializeContract(dogTokenUris);
    }

    // to request VRF
    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert NeedMoreETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requesIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address dogOwner = s_requesIdToSender[requestId];
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE; //getting number between 0-99 using maths mod operator
        // 0-10 will return PUG
        // 11-40 will return shib inu
        // 41 - 99 will return St. bernard
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_dogTokenUris[uint256(dogBreed)]);
        s_tokenCounter = s_tokenCounter + 1;
        emit NftMinted(dogBreed, dogOwner);
    }

    function getBreedFromModdedRng(uint256 moddedRng)
        public
        pure
        returns (Breed)
    {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArracy = getChanceArray();
        for (uint256 i = 0; i < chanceArracy.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < chanceArracy[i]) {
                return Breed(i);
            }
            cumulativeSum = chanceArracy[i];
        }
        revert RandomIpfsNft_RangeOutOfBounds();
    }

    function _initializeContract(string[3] memory dogTokenUris) private {
        if (s_initialized) {
            revert RandomIpfsNft_AlreadyInitialized();
        }
        s_dogTokenUris = dogTokenUris;
        s_initialized = true;
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 40, MAX_CHANCE_VALUE];
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer Failed");
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index)
        public
        view
        returns (string memory)
    {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }
}

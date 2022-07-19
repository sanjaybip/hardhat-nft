import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    BasicNFT,
    RandomIpfsNft,
    DynamicSvgNft,
    VRFCoordinatorV2Mock,
} from "../typechain-types";
import { developmentChains } from "../helper-hardhat-config";

const mint: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    let basicNft: BasicNFT;
    let randomIpfsNft: RandomIpfsNft;
    let dynamicSvgNft: DynamicSvgNft;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;

    const { getNamedAccounts, ethers, network } = hre;
    const { deployer } = await getNamedAccounts();

    // Basic NFT
    basicNft = await ethers.getContract("BasicNFT", deployer);
    const txRespo = await basicNft.mintNft();
    await txRespo.wait(1);
    const tokenUri = await basicNft.tokenURI(0);
    console.log(`Basic NFT index 0 token URI: ${tokenUri}`);
    console.log(`--------------------------`);
    // Random IPFS NFT
    randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomIpfsNft.getMintFee();
    const txRespo1 = await randomIpfsNft.requestNft({ value: mintFee });
    const txReceipt1 = await txRespo1.wait(1);
    //we need to listen response from Chainlink
    await new Promise<void>(async (resolve, reject) => {
        randomIpfsNft.once("NftMinted", async () => {
            try {
                resolve();
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
        if (developmentChains.includes(network.name)) {
            //if in local development, we need to manually fire Chianlink VRF
            try {
                const reqId = txReceipt1.events![1].args!.requestId;
                vrfCoordinatorV2Mock = await ethers.getContract(
                    "VRFCoordinatorV2Mock",
                    deployer
                );
                await vrfCoordinatorV2Mock.fulfillRandomWords(
                    reqId,
                    randomIpfsNft.address
                );
            } catch (e) {
                console.log(e);
                reject(e);
            }
        }
    });
    const tokenUri1 = await randomIpfsNft.tokenURI(0);
    console.log(`Random IPFS NFT index 0 token URI: ${tokenUri1}`);
    console.log(`--------------------------`);

    // Dynamic SVG NFT minting
    dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
    const mintValue = ethers.utils.parseEther("5000");
    const txRespo2 = await dynamicSvgNft.mintNFT(mintValue);
    await txRespo2.wait(1);
    const tokenUri2 = await dynamicSvgNft.tokenURI(0);
    console.log(`Dynamic SVG NFT index 0 token URI: ${tokenUri2}`);
};
export default mint;
mint.tags = ["all", "mint"];

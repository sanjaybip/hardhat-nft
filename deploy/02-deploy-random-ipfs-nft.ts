import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import verify from "../utils/verify";
import { storeImages, storeTokeUriMetadata } from "../utils/uploadToPinata";
import {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config";
import "dotenv/config";

const imagesLocation = "./images/randomNft/";
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
};
let tokenUris = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
];
const FUND_AMOUNT = "1000000000000000000000";
const deployRandomIpfsNft: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { deployments, getNamedAccounts, ethers, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;
    let vrfCoordinatorV2Address, subscriptionId, waitBlockConfirmations;

    if (process.env.UPLOAD_TO_PINATA == "true") {
        log(`---Handling Tokenuri------`);
        tokenUris = await handleTokenUri();
    }

    // if we are on development chain, we need to use mocks
    if (developmentChains.includes(network.name)) {
        waitBlockConfirmations = 1;
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        );
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const vrfTxnResponse = await vrfCoordinatorV2Mock.createSubscription();
        const vrfTxnReceipt = await vrfTxnResponse.wait(1);
        subscriptionId = vrfTxnReceipt.events[0].args.subId;
        // Fund the subscription for TESTING purpose
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(
            subscriptionId,
            FUND_AMOUNT
        );
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
        waitBlockConfirmations = VERIFICATION_BLOCK_CONFIRMATIONS;
    }
    log("------------------Deploying RandomNft---------------------");
    // log(networkConfig[chainId]["gasLane"]);
    // log(networkConfig[chainId]["callBackGasLimit"]);
    // log(vrfCoordinatorV2Address);
    // log(subscriptionId);
    // log(tokenUris);
    // log(networkConfig[chainId]["mintFee"]);
    const args: any[] = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["callBackGasLimit"],
        tokenUris,
        networkConfig[chainId]["mintFee"],
    ];
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });
    //log(`Verification`);
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...");
        await verify(randomIpfsNft.address, args);
    }
};

async function handleTokenUri() {
    const tokenUris = [];
    const { responses: imagesUploadResp, files } = await storeImages(
        imagesLocation
    );
    for (const imagesUploadRespIndex in imagesUploadResp) {
        let tokenUriMetadata = { ...metadataTemplate };
        tokenUriMetadata.name = files[imagesUploadRespIndex].replace(
            ".png",
            ""
        );
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
        tokenUriMetadata.image = `ipfs://${imagesUploadResp[imagesUploadRespIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name}...`);
        const metadataUploadResponse = await storeTokeUriMetadata(
            tokenUriMetadata
        );
        tokenUris.push(`ipfs://${metadataUploadResponse!.IpfsHash}`);
    }
    console.log("Token URIs uploaded! They are:");
    console.log(tokenUris);
    return tokenUris;
}
export default deployRandomIpfsNft;
deployRandomIpfsNft.tags = ["all", "randomipfs", "main"];

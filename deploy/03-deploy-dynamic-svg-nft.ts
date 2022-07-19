import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import "dotenv/config";
import verify from "../utils/verify";
import {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config";

const deployDynamicSvgNft: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    let ethUsdPriceFeed;
    let waitBlockConfirmations;
    const { deployments, getNamedAccounts, ethers, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;
    if (developmentChains.includes(network.name)) {
        waitBlockConfirmations = 1;
        const mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdPriceFeed = mockV3Aggregator.address;
    } else {
        ethUsdPriceFeed = networkConfig[chainId].ethUsdPriceFeed;
        waitBlockConfirmations = VERIFICATION_BLOCK_CONFIRMATIONS;
    }
    log("------------------Deploying DynamicSvgNFT---------------------");
    // get svg images to pass on construtor argumenst
    const lowSvgImage = await fs.readFileSync("./images/dynamicNft/frown.svg", {
        encoding: "utf8",
    });
    const highSvgImage = await fs.readFileSync(
        "./images/dynamicNft/happy.svg",
        {
            encoding: "utf8",
        }
    );
    const args: any[] = [ethUsdPriceFeed, lowSvgImage, highSvgImage];
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });
    // Verify the deployment
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...");
        await verify(dynamicSvgNft.address, args);
    }
};

export default deployDynamicSvgNft;
deployDynamicSvgNft.tags = ["all", "dynamicsvg", "main"];

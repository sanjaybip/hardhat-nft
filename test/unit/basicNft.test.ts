import { assert } from "chai";
import { network, ethers, deployments } from "hardhat";

import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { BasicNFT } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit Test", () => {
          let basicNft: BasicNFT;
          let deployer;
          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["basicnft"]);
              basicNft = await ethers.getContract("BasicNFT");
          });
          it("Shoud Allow Mint NFT", async () => {
              const txResponse = await basicNft.mintNft();
              await txResponse.wait(1);
              const tokenCounter = await basicNft.getTokenCounter();
              assert.equal(tokenCounter.toString(), "1");
              const tokenUri = await basicNft.tokenURI(0);
              assert.equal(tokenUri, await basicNft.TOKEN_URI());
          });
      });

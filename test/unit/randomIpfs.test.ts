import { assert, expect } from "chai";
import { network, ethers, deployments } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { RandomIpfsNft, VRFCoordinatorV2Mock } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNFT Unit Test", () => {
          let randomIpfsNft: RandomIpfsNft;
          let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
          let deployer;
          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["mocks", "randomipfs"]);
              randomIpfsNft = await ethers.getContract("RandomIpfsNft");
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock"
              );
          });
          describe("Testing Constructor", () => {
              it("sets starting values correctly", async () => {
                  const dogTokenuri = await randomIpfsNft.getDogTokenUris(0);
                  expect(dogTokenuri).to.include("ipfs://");
                  const isInitialized = await randomIpfsNft.getInitialized();
                  expect(isInitialized).to.equal(true);
              });
          });
          describe("requestNft", () => {
              it("Reverts if send ETH is less", async () => {
                  const lessmintFee = ethers.utils.parseEther("0.001");

                  await expect(
                      randomIpfsNft.requestNft({
                          value: lessmintFee.toString(),
                      })
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "NeedMoreETHSent"
                  );
              });

              it("Emits events", async () => {
                  const mintFee = await randomIpfsNft.getMintFee();
                  await expect(
                      randomIpfsNft.requestNft({ value: mintFee })
                  ).to.emit(randomIpfsNft, "NftRequested");
              });
          });
          describe("fulfillRandomWords", () => {
              it("Mint NFT aftr VRF returns random number", async () => {
                  await new Promise<void>(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenCountr =
                                  await randomIpfsNft.getTokenCounter();
                              const tokenUri = await randomIpfsNft.tokenURI(0);
                              expect(tokenCountr.toNumber()).to.be.equal(1);
                              expect(tokenUri).to.include("ipfs://");
                              resolve();
                          } catch (e) {
                              console.log(e);
                              reject(e);
                          }
                      });
                      try {
                          const mintFee = await randomIpfsNft.getMintFee();
                          const txResponse = await randomIpfsNft.requestNft({
                              value: mintFee,
                          });
                          const txReceipt = await txResponse.wait(1);
                          const reqId = txReceipt.events![1].args!.requestId;

                          //since we are on locahost we are mocking, but on actual testnet we don't need this.
                          vrfCoordinatorV2Mock.fulfillRandomWords(
                              reqId,
                              randomIpfsNft.address
                          );
                      } catch (e) {
                          console.log(e);
                          reject(e);
                      }
                  });
              });
          });
      });

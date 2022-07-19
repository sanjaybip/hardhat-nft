# Generate 3 Types of NFT.

A sample web3 application that allows to create the 3 types of NFT.

## 1. Basic NFT
`contracts/BasicNFT.sol` Allows to MINT a basic NFT which is already hosted on [IPFS](https://ipfs.io/). It has Token URI and Images associated with it.

## 2. Random IPFS NFT
`contracts/RandomIpfsNft.sol` Allows to MINT a random NFT from a set of 3 NFT token. It also set rarity for each NFT and will programmatically upload it to IPFS using [pinata](https://www.pinata.cloud/) service. 

## 2. Dynamic SVG NFT
`contracts/DynamicSvgNft.sol` Allows to MINT a SVG NFT that are hosted on-chain. We have two NFTes and based on minting cost we assign NFT to the minter. Using some advance solidity method and Base64 we encode our SVG file, add metadata and upload it to our blockchain.

---

The deploy scripts are inside the `deploy` folder. We also have used Chainlink VRF for generating Random NFT. Tests are inside `test` folder.

This web3 application is developed using `Hardhat` and `TypeScript` while following Patrick Collins course.

---

## Running the code
To run and test the code in your local development machine copy the repository with the following command. We have used `yarn` package manager to install all dependencies. You can use `NPM`.

```shell
git clone https://github.com/sanjaydefidev/hardhat-nft
```
Installing all the dependencies
```shell
yarn install
```
Check out this [link](https://github.com/PatrickAlphaC/hardhat-nft-fcc) for more information about this tutorial.

## Note
Thanks to @PatrickAlphaC for creating such a helpful tutorial.


export interface networkConfigItem {
    name: string;
    vrfCoordinatorV2?: string;
    subscriptionId?: string;
    gasLane?: string;
    callBackGasLimit?: string;
    mintFee?: string;
    ethUsdPriceFeed?: string;
}
export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}
export const networkConfig: networkConfigInfo = {
    31337: {
        name: "localhost",
        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", //30 gwei
        callBackGasLimit: "500000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
    },
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cffcacd319c818142124b7a15e857ab",
        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "7783",
        callBackGasLimit: "500000",
        mintFee: "10000000000000000", // 0.01 ETH
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
};
export const DECIMALS = "18";
export const INITIAL_PRICE = "200000000000000000000"; //200 eth
export const VERIFICATION_BLOCK_CONFIRMATIONS = 4;
export const developmentChains = ["hardhat", "localhost"];

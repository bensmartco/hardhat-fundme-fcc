const { ethers, network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { varify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let etherUsdPriceFeed;
  //   const etherUsdPriceFeed = networkConfig[chainId][usdPriceFeedAddress];
  if (developmentChains.includes(network.name)) {
    const ethUSDAggregator = await deployments.get("MockV3Aggregator");
    etherUsdPriceFeed = ethUSDAggregator.address;
  } else {
    etherUsdPriceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  }
  const arg = [etherUsdPriceFeed];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: arg,
    log: true,
    waitComfirmations: network.config.blockComfirmation || 1,
  });
  log("Fund me deployed");
  log("_______________________________________________________");
   console.log(deployer);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await varify(fundMe.address, arg);
  }
};
module.exports.tags = ["all", "fundMe"];

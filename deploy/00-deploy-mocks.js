const { network } = require("hardhat");
const {
  developmentChains,
  DECIMAL,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local Testnet dictected, Deploying mocks...");
    const mockV3Aggregator = await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMAL, INITIAL_ANSWER],
    });
    log("Mock deployed...");
    log("_____________________________________________________");
  }
};

module.exports.tags = ["all", "mocks"];

const { getNamedAccounts, ethers } = require("hardhat");
async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding.......");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.5"),
  });
  const transactionReciept = await transactionResponse.wait(1);
  console.log("Funded....");
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    process.exitCode = 0;
    console.log(error);
  });

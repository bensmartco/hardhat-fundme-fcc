const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const fundValue = ethers.utils.parseEther("0.5");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture("all");
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("Contrust", async () => {
        it("Set the aggregator address correctly", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      //   it("Should receive ethers", async () => {
      //     const provider = new ethers.providers.JsonRpcProvider(
      //       "http://127.0.0.1:8545"
      //     );
      //     const valueToSend = await ethers.utils.parseEther("1");
      //     const senderAddress = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0";
      //     const beforeBalance = await ethers.provider.getBalance(fundMe.address);
      //     await provider.send("eth_sendTransaction", {
      //       from: senderAddress,
      //       to: fundMe.address,
      //       value: valueToSend,
      //     });
      //     const afterBalance = await ethers.provider.getBalance(fundMe.address);
      //     assert.equal(afterBalance, beforeBalance.add(valueToSend));
      //   });

      describe("Fund", async () => {
        it("Failed if you no send enogh eth", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("Updated the amount founded data structure", async () => {
          await fundMe.fund({ value: fundValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), fundValue.toString());
        });
        it("Add found to arrays of getFunders", async () => {
          await fundMe.fund({ value: fundValue });
          const response = await fundMe.getFunders(0);
          assert.equal(response, deployer);
        });
      });

      describe("Withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: fundValue });
        });
        it("withdraw eth from a single founder", async () => {
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReciept = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReciept;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("allow us to withdraw multiple fund", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnect = await fundMe.connect(accounts[i]);
            await fundMeConnect.fund({ value: fundValue });
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          const transactionResponse = await fundMe.withdraw();
          const transactionReciept = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReciept;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          await expect(fundMe.getFunders(0)).to.be.reverted;
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allow the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const connectAttacker = await fundMe.connect(accounts[1]);
          await expect(connectAttacker.withdraw()).not.to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });
      });
    });

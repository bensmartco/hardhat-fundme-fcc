const { run } = require("hardhat");
async function varify(contractAddress, arg) {
  console.log("Verifying contract...");
  console.log(arg);
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: arg,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verify")) {
      console.log("Already Verify");
    } else {
      console.log(e);
    }
  }
}
module.exports = { varify };

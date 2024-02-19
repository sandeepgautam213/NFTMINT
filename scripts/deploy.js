const hre = require("hardhat");

async function main() {

  const NFT = await hre.ethers.deployContract("NFT", ["Alien", "AI", hre.ethers.parseEther('0.001')]);

  await NFT.waitForDeployment();

  console.log(
    `Contract deployed at address: ${await NFT.getAddress()}`
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
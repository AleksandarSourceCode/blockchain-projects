import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying OZERC1155");
  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH",
  );

  const BASE_URI =
    "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/main/json/collections/wow/ERC1155/{id}.json";

  const token = await ethers.deployContract("OZERC1155", [BASE_URI]);

  await token.waitForDeployment();

  console.log("OZERC1155 deployed at:", await token.getAddress());
  console.log("Base URI:", await token.uri(0));
  console.log("Owner:", await token.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

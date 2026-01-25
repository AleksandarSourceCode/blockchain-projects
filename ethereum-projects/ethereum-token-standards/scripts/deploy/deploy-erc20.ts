import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying OZERC20");
  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH",
  );

  const NAME = "OZ ERC20 Token";
  const SYMBOL = "OZT";

  // Values are expressed in human units (decimals applied in the contract)
  const INITIAL_SUPPLY = 1_000_000n;
  const CAP = 10_000_000n;

  const token = await ethers.deployContract("OZERC20", [
    NAME,
    SYMBOL,
    INITIAL_SUPPLY,
    CAP,
  ]);

  await token.waitForDeployment();

  console.log("OZERC20 deployed at:", await token.getAddress());

  console.log("Name:         ", await token.name());
  console.log("Symbol:       ", await token.symbol());
  console.log(
    "Total Supply: ",
    ethers.formatUnits(await token.totalSupply(), 18),
  );
  console.log("Cap:          ", ethers.formatUnits(await token.cap(), 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

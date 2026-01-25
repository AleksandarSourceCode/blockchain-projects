import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;

  const networkInfo = await provider.getNetwork();

  console.log("Deploying OZERC721");
  console.log("Deployer:", deployer.address);
  console.log("Network:", networkInfo.chainId);
  console.log(
    "Balance:",
    ethers.formatEther(await provider.getBalance(deployer.address)),
    "ETH",
  );

  const NAME = "OZ NFT Collection";
  const SYMBOL = "OZNFT";

  const ROYALTY_RECEIVER = deployer.address;
  const ROYALTY_FEE = 500; // basis points (5%)

  const nft = await ethers.deployContract("OZERC721", [
    NAME,
    SYMBOL,
    ROYALTY_RECEIVER,
    ROYALTY_FEE,
  ]);

  await nft.waitForDeployment();

  console.log("OZERC721 deployed at:", await nft.getAddress());
  console.log("Owner:", await nft.owner());

  const [, royalty] = await nft.royaltyInfo(0n, 10n ** 18n);
  console.log("Royalty on 1 ETH:", ethers.formatEther(royalty), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

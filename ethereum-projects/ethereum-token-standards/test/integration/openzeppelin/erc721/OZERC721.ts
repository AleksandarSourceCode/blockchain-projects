import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("OZERC721 – integration", function () {
  const NAME = "OZ NFT";
  const SYMBOL = "OZNFT";

  const TOKEN_ID = 1n;

  const URI_1 = "https://example.com/metadata/1.json";

  const ROYALTY_FEE = 500; // 5%

  const ONE_ETH = 1n * 10n ** 18n;

  it("deploys with correct metadata and royalties", async function () {
    const [owner] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC721", [
      NAME,
      SYMBOL,
      owner.address,
      ROYALTY_FEE,
    ]);
    await nft.waitForDeployment();

    expect(await nft.name()).to.equal(NAME);
    expect(await nft.symbol()).to.equal(SYMBOL);
    expect(await nft.owner()).to.equal(owner.address);

    const [receiver, amount] = await nft.royaltyInfo(TOKEN_ID, ONE_ETH);

    expect(receiver).to.equal(owner.address);
    expect(amount).to.equal(5n * 10n ** 16n); // 0.05 ETH
  });

  it("owner can mint NFT with tokenURI", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC721", [
      NAME,
      SYMBOL,
      user1.address,
      ROYALTY_FEE,
    ]);
    await nft.waitForDeployment();

    await expect(nft.mint(user1.address, TOKEN_ID, URI_1))
      .to.emit(nft, "Transfer")
      .withArgs(ethers.ZeroAddress, user1.address, TOKEN_ID);

    expect(await nft.ownerOf(TOKEN_ID)).to.equal(user1.address);
    expect(await nft.tokenURI(TOKEN_ID)).to.equal(URI_1);
  });

  it("non-owner cannot mint", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC721", [
      NAME,
      SYMBOL,
      user1.address,
      ROYALTY_FEE,
    ]);
    await nft.waitForDeployment();

    await expect(
      nft.connect(user2).mint(user2.address, TOKEN_ID, URI_1),
    ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
  });

  it("transfer preserves tokenURI", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC721", [
      NAME,
      SYMBOL,
      user1.address,
      ROYALTY_FEE,
    ]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID, URI_1);

    await nft
      .connect(user1)
      .transferFrom(user1.address, user2.address, TOKEN_ID);

    expect(await nft.ownerOf(TOKEN_ID)).to.equal(user2.address);
    expect(await nft.tokenURI(TOKEN_ID)).to.equal(URI_1);
  });

  it("burn removes token and tokenURI", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC721", [
      NAME,
      SYMBOL,
      user1.address,
      ROYALTY_FEE,
    ]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID, URI_1);

    await expect(nft.connect(user1).burn(TOKEN_ID))
      .to.emit(nft, "Transfer")
      .withArgs(user1.address, ethers.ZeroAddress, TOKEN_ID);

    await expect(nft.ownerOf(TOKEN_ID)).to.be.revertedWithCustomError(
      nft,
      "ERC721NonexistentToken",
    );

    await expect(nft.tokenURI(TOKEN_ID)).to.be.revertedWithCustomError(
      nft,
      "ERC721NonexistentToken",
    );
  });

  it("unauthorized address cannot burn", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC721", [
      NAME,
      SYMBOL,
      user1.address,
      ROYALTY_FEE,
    ]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID, URI_1);

    await expect(
      nft.connect(user2).burn(TOKEN_ID),
    ).to.be.revertedWithCustomError(nft, "ERC721InsufficientApproval");
  });

  it("operator approval allows transfer and burn", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC721", [
      NAME,
      SYMBOL,
      user1.address,
      ROYALTY_FEE,
    ]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID, URI_1);

    await nft.connect(user1).setApprovalForAll(user2.address, true);

    await nft
      .connect(user2)
      .transferFrom(user1.address, user2.address, TOKEN_ID);

    expect(await nft.ownerOf(TOKEN_ID)).to.equal(user2.address);

    await nft.connect(user2).burn(TOKEN_ID);

    await expect(nft.ownerOf(TOKEN_ID)).to.be.revertedWithCustomError(
      nft,
      "ERC721NonexistentToken",
    );
  });
});

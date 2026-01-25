import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SimpleERC721 – integration", function () {
  const NAME = "Simple NFT";
  const SYMBOL = "SNFT";

  const TOKEN_ID = 1n;
  const TOKEN_ID_2 = 2n;

  it("deploys with correct metadata and owner", async function () {
    const [owner] = await ethers.getSigners();

    const nft = await ethers.deployContract("SimpleERC721", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    expect(await nft.name()).to.equal(NAME);
    expect(await nft.symbol()).to.equal(SYMBOL);
    expect(await nft.owner()).to.equal(owner.address);
  });

  it("owner can mint and emits Transfer event", async function () {
    const [owner, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("SimpleERC721", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await expect(nft.mint(user1.address, TOKEN_ID))
      .to.emit(nft, "Transfer")
      .withArgs(ethers.ZeroAddress, user1.address, TOKEN_ID);

    expect(await nft.ownerOf(TOKEN_ID)).to.equal(user1.address);
    expect(await nft.balanceOf(user1.address)).to.equal(1n);
  });

  it("non-owner cannot mint", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("SimpleERC721", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await expect(
      nft.connect(user1).mint(user1.address, TOKEN_ID),
    ).to.be.revertedWith("not owner");
  });

  it("approve + transferFrom works", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("SimpleERC721", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID);

    await expect(nft.connect(user1).approve(user2.address, TOKEN_ID))
      .to.emit(nft, "Approval")
      .withArgs(user1.address, user2.address, TOKEN_ID);

    await expect(
      nft.connect(user2).transferFrom(user1.address, user2.address, TOKEN_ID),
    )
      .to.emit(nft, "Transfer")
      .withArgs(user1.address, user2.address, TOKEN_ID);

    expect(await nft.ownerOf(TOKEN_ID)).to.equal(user2.address);
    expect(await nft.balanceOf(user1.address)).to.equal(0n);
    expect(await nft.balanceOf(user2.address)).to.equal(1n);
  });

  it("operator approval allows transfers of all tokens", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("SimpleERC721", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID);
    await nft.mint(user1.address, TOKEN_ID_2);

    await expect(nft.connect(user1).setApprovalForAll(user2.address, true))
      .to.emit(nft, "ApprovalForAll")
      .withArgs(user1.address, user2.address, true);

    await nft
      .connect(user2)
      .transferFrom(user1.address, user2.address, TOKEN_ID);

    await nft
      .connect(user2)
      .transferFrom(user1.address, user2.address, TOKEN_ID_2);

    expect(await nft.balanceOf(user2.address)).to.equal(2n);
  });

  it("burn removes token and emits Transfer to zero address", async function () {
    const [owner, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("SimpleERC721", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID);

    await expect(nft.connect(user1).burn(TOKEN_ID))
      .to.emit(nft, "Transfer")
      .withArgs(user1.address, ethers.ZeroAddress, TOKEN_ID);

    await expect(nft.ownerOf(TOKEN_ID)).to.be.revertedWith("nonexistent token");

    expect(await nft.balanceOf(user1.address)).to.equal(0n);
  });

  it("unauthorized address cannot transfer or burn", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("SimpleERC721", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID);

    await expect(
      nft.connect(user2).transferFrom(user1.address, user2.address, TOKEN_ID),
    ).to.be.revertedWith("not authorized");

    await expect(nft.connect(user2).burn(TOKEN_ID)).to.be.revertedWith(
      "not authorized",
    );
  });
});

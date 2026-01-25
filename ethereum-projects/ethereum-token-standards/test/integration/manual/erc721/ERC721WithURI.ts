import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("ERC721WithURI – integration", function () {
  const NAME = "Manual NFT";
  const SYMBOL = "MNFT";

  const TOKEN_ID = 1n;
  const TOKEN_ID_2 = 2n;

  const URI_1 = "https://example.com/metadata/1.json";
  const URI_2 = "https://example.com/metadata/2.json";

  it("deploys with correct metadata", async function () {
    const [owner] = await ethers.getSigners();

    const nft = await ethers.deployContract("ERC721WithURI", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    expect(await nft.name()).to.equal(NAME);
    expect(await nft.symbol()).to.equal(SYMBOL);
    expect(await nft.owner()).to.equal(owner.address);
  });

  it("owner can mint NFT with tokenURI", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("ERC721WithURI", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await expect(
      nft["mint(address,uint256,string)"](user1.address, TOKEN_ID, URI_1),
    )
      .to.emit(nft, "Transfer")
      .withArgs(ethers.ZeroAddress, user1.address, TOKEN_ID);

    expect(await nft.ownerOf(TOKEN_ID)).to.equal(user1.address);
    expect(await nft.tokenURI(TOKEN_ID)).to.equal(URI_1);
  });

  it("non-owner cannot mint", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("ERC721WithURI", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await expect(
      nft
        .connect(user1)
        ["mint(address,uint256,string)"](user1.address, TOKEN_ID, URI_1),
    ).to.be.revertedWith("not owner");
  });

  it("tokenURI is isolated per token", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("ERC721WithURI", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft["mint(address,uint256,string)"](user1.address, TOKEN_ID, URI_1);

    await nft["mint(address,uint256,string)"](user2.address, TOKEN_ID_2, URI_2);

    expect(await nft.tokenURI(TOKEN_ID)).to.equal(URI_1);
    expect(await nft.tokenURI(TOKEN_ID_2)).to.equal(URI_2);
  });

  it("approve + transferFrom keeps tokenURI intact", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("ERC721WithURI", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft["mint(address,uint256,string)"](user1.address, TOKEN_ID, URI_1);

    await nft.connect(user1).approve(user2.address, TOKEN_ID);

    await nft
      .connect(user2)
      .transferFrom(user1.address, user2.address, TOKEN_ID);

    expect(await nft.ownerOf(TOKEN_ID)).to.equal(user2.address);
    expect(await nft.tokenURI(TOKEN_ID)).to.equal(URI_1);
  });

  it("burn deletes token and tokenURI", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("ERC721WithURI", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft["mint(address,uint256,string)"](user1.address, TOKEN_ID, URI_1);

    await expect(nft.connect(user1).burn(TOKEN_ID))
      .to.emit(nft, "Transfer")
      .withArgs(user1.address, ethers.ZeroAddress, TOKEN_ID);

    await expect(nft.ownerOf(TOKEN_ID)).to.be.revertedWith("nonexistent token");

    await expect(nft.tokenURI(TOKEN_ID)).to.be.revertedWith(
      "nonexistent token",
    );
  });

  it("unauthorized address cannot burn", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("ERC721WithURI", [NAME, SYMBOL]);
    await nft.waitForDeployment();

    await nft["mint(address,uint256,string)"](user1.address, TOKEN_ID, URI_1);

    await expect(nft.connect(user2).burn(TOKEN_ID)).to.be.revertedWith(
      "not authorized",
    );
  });
});

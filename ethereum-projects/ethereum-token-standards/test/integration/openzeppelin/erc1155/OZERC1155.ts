import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("OZERC1155 – integration", function () {
  const BASE_URI = "https://example.com/metadata/{id}.json";

  const TOKEN_ID_1 = 1n;
  const TOKEN_ID_2 = 2n;

  const AMOUNT_1 = 100n;
  const AMOUNT_2 = 50n;

  it("deploys with correct URI", async function () {
    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    expect(await nft.uri(TOKEN_ID_1)).to.equal(BASE_URI);
  });

  it("owner can mint single token", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID_1, AMOUNT_1, "0x");

    expect(await nft.balanceOf(user1.address, TOKEN_ID_1)).to.equal(AMOUNT_1);
  });

  it("non-owner cannot mint", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    await expect(
      nft.connect(user1).mint(user1.address, TOKEN_ID_1, AMOUNT_1, "0x"),
    ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
  });

  it("owner can mint batch tokens", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    await nft.mintBatch(
      user1.address,
      [TOKEN_ID_1, TOKEN_ID_2],
      [AMOUNT_1, AMOUNT_2],
      "0x",
    );

    expect(await nft.balanceOf(user1.address, TOKEN_ID_1)).to.equal(AMOUNT_1);

    expect(await nft.balanceOf(user1.address, TOKEN_ID_2)).to.equal(AMOUNT_2);
  });

  it("safeTransferFrom transfers balance", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID_1, AMOUNT_1, "0x");

    await nft
      .connect(user1)
      .safeTransferFrom(user1.address, user2.address, TOKEN_ID_1, 40n, "0x");

    expect(await nft.balanceOf(user1.address, TOKEN_ID_1)).to.equal(60n);

    expect(await nft.balanceOf(user2.address, TOKEN_ID_1)).to.equal(40n);
  });

  it("safeBatchTransferFrom transfers multiple tokens", async function () {
    const [, user1, user2] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    await nft.mintBatch(
      user1.address,
      [TOKEN_ID_1, TOKEN_ID_2],
      [AMOUNT_1, AMOUNT_2],
      "0x",
    );

    await nft
      .connect(user1)
      .safeBatchTransferFrom(
        user1.address,
        user2.address,
        [TOKEN_ID_1, TOKEN_ID_2],
        [20n, 10n],
        "0x",
      );

    expect(await nft.balanceOf(user2.address, TOKEN_ID_1)).to.equal(20n);

    expect(await nft.balanceOf(user2.address, TOKEN_ID_2)).to.equal(10n);
  });

  it("burn reduces balance", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    await nft.mint(user1.address, TOKEN_ID_1, AMOUNT_1, "0x");

    await nft.connect(user1).burn(user1.address, TOKEN_ID_1, 30n);

    expect(await nft.balanceOf(user1.address, TOKEN_ID_1)).to.equal(70n);
  });

  it("burnBatch reduces balances", async function () {
    const [, user1] = await ethers.getSigners();

    const nft = await ethers.deployContract("OZERC1155", [BASE_URI]);
    await nft.waitForDeployment();

    await nft.mintBatch(
      user1.address,
      [TOKEN_ID_1, TOKEN_ID_2],
      [AMOUNT_1, AMOUNT_2],
      "0x",
    );

    await nft
      .connect(user1)
      .burnBatch(user1.address, [TOKEN_ID_1, TOKEN_ID_2], [25n, 15n]);

    expect(await nft.balanceOf(user1.address, TOKEN_ID_1)).to.equal(75n);

    expect(await nft.balanceOf(user1.address, TOKEN_ID_2)).to.equal(35n);
  });
});

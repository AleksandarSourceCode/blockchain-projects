import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("OZERC20 – integration", function () {
  const NAME = "OZ Token";
  const SYMBOL = "OZT";
  const INITIAL_SUPPLY = 1_000n;
  const CAP = 2_000n;
  const ONE = 1n * 10n ** 18n;

  it("emits Transfer(address(0), owner, supply) on deploy", async function () {
    const [owner] = await ethers.getSigners();

    const fromBlock = await ethers.provider.getBlockNumber();

    const token = await ethers.deployContract("OZERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    const events = await token.queryFilter(
      token.filters.Transfer(),
      fromBlock,
      "latest",
    );

    expect(events.length).to.equal(1);

    const { from, to, value } = events[0].args;

    expect(from).to.equal(ethers.ZeroAddress);
    expect(to).to.equal(owner.address);
    expect(value).to.equal(INITIAL_SUPPLY * ONE);
  });

  it("allows transfers when not paused", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("OZERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    await token.transfer(user1.address, 100n * ONE);

    expect(await token.balanceOf(user1.address)).to.equal(100n * ONE);
    expect(await token.balanceOf(owner.address)).to.equal(
      (INITIAL_SUPPLY - 100n) * ONE,
    );
  });

  it("pause emits event and blocks transfers", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("OZERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    await expect(token.pause())
      .to.emit(token, "Paused")
      .withArgs(owner.address);

    await expect(
      token.transfer(user1.address, ONE),
    ).to.be.revertedWithCustomError(token, "EnforcedPause");
  });

  it("unpause emits event and restores transfers", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("OZERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    await token.pause();

    await expect(token.unpause())
      .to.emit(token, "Unpaused")
      .withArgs(owner.address);

    await token.transfer(user1.address, 50n * ONE);
    expect(await token.balanceOf(user1.address)).to.equal(50n * ONE);
  });

  it("owner can mint until cap is reached", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("OZERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.mint(user1.address, 500n);

    const events = await token.queryFilter(
      token.filters.Transfer(ethers.ZeroAddress, user1.address),
      fromBlock,
      "latest",
    );

    expect(events.length).to.equal(1);
    expect(events[0].args.value).to.equal(500n * ONE);
    expect(await token.totalSupply()).to.equal(1_500n * ONE);

    await expect(token.mint(user1.address, 600n)).to.be.revertedWithCustomError(
      token,
      "ERC20ExceededCap",
    );
  });

  it("approve + transferFrom work as expected", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    const token = await ethers.deployContract("OZERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    await token.approve(user1.address, 200n * ONE);

    await token
      .connect(user1)
      .transferFrom(owner.address, user2.address, 80n * ONE);

    expect(await token.balanceOf(user2.address)).to.equal(80n * ONE);
    expect(await token.allowance(owner.address, user1.address)).to.equal(
      120n * ONE,
    );
  });

  it("burn reduces total supply and emits Transfer to zero address", async function () {
    const [owner] = await ethers.getSigners();

    const token = await ethers.deployContract("OZERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.burn(300n * ONE);

    const events = await token.queryFilter(
      token.filters.Transfer(owner.address, ethers.ZeroAddress),
      fromBlock,
      "latest",
    );

    const burned = events.reduce((sum, e) => sum + e.args.value, 0n);

    expect(burned).to.equal(300n * ONE);
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY * ONE - burned);
  });
});

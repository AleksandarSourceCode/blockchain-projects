import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("CappedPausableERC20", function () {
  const NAME = "Capped Token";
  const SYMBOL = "CAP";
  const INITIAL_SUPPLY = 1_000n;
  const CAP = 2_000n;
  const ONE = 1n * 10n ** 18n;

  it("emits Transfer(address(0), owner, supply) on deploy", async function () {
    const [owner] = await ethers.getSigners();

    const fromBlock = await ethers.provider.getBlockNumber();

    const token = await ethers.deployContract("CappedPausableERC20", [
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

  it("mint events increase total supply without exceeding cap", async function () {
    const [, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("CappedPausableERC20", [
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

    const minted = events.reduce((sum, e) => sum + e.args.value, 0n);

    expect(minted).to.equal(500n * ONE);
    expect(await token.totalSupply()).to.equal((INITIAL_SUPPLY + 500n) * ONE);

    await expect(token.mint(user1.address, 600n)).to.be.revertedWith(
      "cap exceeded",
    );
  });

  it("pause emits Paused and blocks transfers", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("CappedPausableERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.pause();

    const events = await token.queryFilter(
      token.filters.Paused(),
      fromBlock,
      "latest",
    );

    expect(events.length).to.equal(1);
    expect(events[0].args.account).to.equal(owner.address);

    await expect(token.transfer(user1.address, ONE)).to.be.revertedWith(
      "paused",
    );
  });

  it("unpause emits Unpaused and restores transfers", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("CappedPausableERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    await token.pause();

    const fromBlock = await ethers.provider.getBlockNumber();
    await token.unpause();

    const events = await token.queryFilter(
      token.filters.Unpaused(),
      fromBlock,
      "latest",
    );

    expect(events.length).to.equal(1);
    expect(events[0].args.account).to.equal(owner.address);

    await token.transfer(user1.address, 100n * ONE);
    expect(await token.balanceOf(user1.address)).to.equal(100n * ONE);
  });

  it("increase/decreaseAllowance reflected in Approval events", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("CappedPausableERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.increaseAllowance(user1.address, 200n * ONE);
    await token.decreaseAllowance(user1.address, 50n * ONE);

    const events = await token.queryFilter(
      token.filters.Approval(owner.address, user1.address),
      fromBlock,
      "latest",
    );

    const last = events[events.length - 1];

    expect(last.args.value).to.equal(150n * ONE);
    expect(await token.allowance(owner.address, user1.address)).to.equal(
      150n * ONE,
    );
  });

  it("burn events reduce total supply", async function () {
    const [owner] = await ethers.getSigners();

    const token = await ethers.deployContract("CappedPausableERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.burn(300n);

    const events = await token.queryFilter(
      token.filters.Transfer(owner.address, ethers.ZeroAddress),
      fromBlock,
      "latest",
    );

    const burned = events.reduce((sum, e) => sum + e.args.value, 0n);

    expect(burned).to.equal(300n * ONE);
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY * ONE - burned);
  });

  it("pause blocks mint and burn", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("CappedPausableERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
      CAP,
    ]);
    await token.waitForDeployment();

    await token.pause();

    await expect(token.mint(user1.address, 1n)).to.be.revertedWith("paused");
    await expect(token.burn(1n)).to.be.revertedWith("paused");
  });
});

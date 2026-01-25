import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SimpleERC20", function () {
  const NAME = "Simple Token";
  const SYMBOL = "SIM";
  const INITIAL_SUPPLY = 1_000n;
  const ONE = 1n * 10n ** 18n;

  it("emits Transfer(address(0), owner, supply) on deploy", async function () {
    const [owner] = await ethers.getSigners();

    const fromBlock = await ethers.provider.getBlockNumber();

    const token = await ethers.deployContract("SimpleERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
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

  it("transfer events match balance changes", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    const token = await ethers.deployContract("SimpleERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.transfer(user1.address, 100n * ONE);
    await token.transfer(user2.address, 50n * ONE);
    await token.transfer(user1.address, 25n * ONE);

    const events = await token.queryFilter(
      token.filters.Transfer(owner.address),
      fromBlock,
      "latest",
    );

    const totalSent = events.reduce((sum, e) => sum + e.args.value, 0n);

    expect(totalSent).to.equal(175n * ONE);
    expect(await token.balanceOf(owner.address)).to.equal(
      INITIAL_SUPPLY * ONE - totalSent,
    );
  });

  it("approve + transferFrom reflect allowance usage", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    const token = await ethers.deployContract("SimpleERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.approve(user1.address, 200n * ONE);
    await token
      .connect(user1)
      .transferFrom(owner.address, user2.address, 80n * ONE);

    const approvalEvents = await token.queryFilter(
      token.filters.Approval(owner.address, user1.address),
      fromBlock,
      "latest",
    );

    const transferEvents = await token.queryFilter(
      token.filters.Transfer(owner.address, user2.address),
      fromBlock,
      "latest",
    );

    expect(approvalEvents.length).to.equal(1);
    expect(transferEvents.length).to.equal(1);
    expect(transferEvents[0].args.value).to.equal(80n * ONE);

    expect(await token.allowance(owner.address, user1.address)).to.equal(
      120n * ONE,
    );
  });

  it("burn events reduce total supply", async function () {
    const [owner] = await ethers.getSigners();

    const token = await ethers.deployContract("SimpleERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
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

  it("mint events increase total supply", async function () {
    const [owner, user1] = await ethers.getSigners();

    const token = await ethers.deployContract("SimpleERC20", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
    ]);
    await token.waitForDeployment();

    const fromBlock = await ethers.provider.getBlockNumber();

    await token.mint(user1.address, 400n);

    const events = await token.queryFilter(
      token.filters.Transfer(ethers.ZeroAddress, user1.address),
      fromBlock,
      "latest",
    );

    const minted = events.reduce((sum, e) => sum + e.args.value, 0n);

    expect(minted).to.equal(400n * ONE);
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY * ONE + minted);
  });
});

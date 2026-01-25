import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("AMM – Integration", function () {
  it("runs full AMM lifecycle (add liquidity → swap → remove liquidity)", async function () {
    const [user] = await ethers.getSigners();

    // Deploy tokens

    const token0 = await ethers.deployContract("SimpleERC20", [
      "Token0",
      "T0",
      18,
    ]);
    const token1 = await ethers.deployContract("SimpleERC20", [
      "Token1",
      "T1",
      18,
    ]);

    // Deploy AMM

    const amm = await ethers.deployContract("Amm", [
      token0.target,
      token1.target,
      30,
    ]);

    // Mint & approve

    await token0.mint(user.address, ethers.parseEther("1000"));
    await token1.mint(user.address, ethers.parseEther("1000"));

    await token0.approve(amm.target, ethers.MaxUint256);
    await token1.approve(amm.target, ethers.MaxUint256);

    // Add Liquidity

    await expect(
      amm.addLiquidity(ethers.parseEther("500"), ethers.parseEther("500")),
    ).to.emit(amm, "LiquidityAdded");

    let [r0, r1] = await amm.reserves();
    expect(r0).to.equal(ethers.parseEther("500"));
    expect(r1).to.equal(ethers.parseEther("500"));

    // Swap

    await expect(
      amm.swapExactIn(token0.target, ethers.parseEther("10"), 0),
    ).to.emit(amm, "Swap");

    [r0, r1] = await amm.reserves();
    expect(r0).to.be.gt(ethers.parseEther("500"));
    expect(r1).to.be.lt(ethers.parseEther("500"));

    // Remove Liquidity

    await expect(amm.removeLiquidity(ethers.parseEther("100"))).to.emit(
      amm,
      "LiquidityRemoved",
    );

    [r0, r1] = await amm.reserves();
    expect(r0).to.be.lt(ethers.parseEther("510"));
    expect(r1).to.be.lt(ethers.parseEther("500"));
  });
});

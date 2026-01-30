import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Employee Voting – Integration Flow", function () {
  async function deployFixture() {
    const [admin, employee1, employee2, outsider] = await ethers.getSigners();

    // Registry
    const Registry = await ethers.getContractFactory("EmployeeRegistry");
    const registry = await Registry.deploy(admin.address);

    await registry.connect(admin).addEmployee(employee1.address);
    await registry.connect(admin).addEmployee(employee2.address);

    // Simple Voting
    const SimpleVoting = await ethers.getContractFactory("SimpleBinaryVoting");
    const simpleVoting = await SimpleVoting.deploy(
      admin.address,
      registry.target,
    );

    // Weighted Voting
    // Token
    const Token = await ethers.getContractFactory("VotingToken");
    const token = await Token.deploy(admin.address, "Voting Token", "VOTE");

    // mint tokens to employees
    await token.connect(admin).mint(employee1.address, 1000);
    await token.connect(admin).mint(employee2.address, 500);

    const minStake = 100;
    const maxStake = 1000;

    const WeightedVoting = await ethers.getContractFactory(
      "WeightedBinaryVoting",
    );
    const weightedVoting = await WeightedVoting.deploy(
      admin.address,
      registry.target,
      token.target,
      minStake,
      maxStake,
    );

    return {
      admin,
      employee1,
      employee2,
      outsider,
      registry,
      token,
      simpleVoting,
      weightedVoting,
    };
  }

  it("runs full simple + weighted voting lifecycle", async function () {
    const {
      admin,
      employee1,
      employee2,
      outsider,
      token,
      simpleVoting,
      weightedVoting,
    } = await deployFixture();

    // SIMPLE VOTING
    const now = (await ethers.provider.getBlock("latest"))!.timestamp;

    await simpleVoting.connect(admin).createProposal(now + 1, now + 100);

    const simpleProposalId = 1;

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine", []);

    // first vote implicitly activates proposal
    await simpleVoting.connect(employee1).vote(simpleProposalId, true);

    await simpleVoting.connect(employee2).vote(simpleProposalId, false);

    await expect(
      simpleVoting.connect(outsider).vote(simpleProposalId, true),
    ).to.be.revertedWithCustomError(simpleVoting, "NotEmployee");

    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);

    // proposal is implicitly closed by time (state updates on next sync)
    const simpleProposal = await simpleVoting.getProposal(simpleProposalId);

    expect(simpleProposal.yesVotes).to.equal(1);
    expect(simpleProposal.noVotes).to.equal(1);

    // WEIGHTED VOTING
    await token.connect(employee1).approve(weightedVoting.target, 500);

    await token.connect(employee2).approve(weightedVoting.target, 300);

    await weightedVoting.connect(employee1).stake(500);
    await weightedVoting.connect(employee2).stake(300);

    await weightedVoting.connect(admin).createProposal(now + 300, now + 600);

    const weightedProposalId = 1;

    await ethers.provider.send("evm_increaseTime", [350]);
    await ethers.provider.send("evm_mine", []);

    // first vote implicitly activates proposal
    await weightedVoting.connect(employee1).vote(weightedProposalId, true);

    await weightedVoting.connect(employee2).vote(weightedProposalId, false);

    await ethers.provider.send("evm_increaseTime", [400]);
    await ethers.provider.send("evm_mine", []);

    const weightedProposal = await weightedVoting.getProposal(
      weightedProposalId,
    );

    expect(weightedProposal.yesVotes).to.equal(500);
    expect(weightedProposal.noVotes).to.equal(300);

    // UNSTAKE FLOW
    await weightedVoting.connect(employee1).unlockStake();
    await weightedVoting.connect(employee2).unlockStake();

    await weightedVoting.connect(employee1).unstake(500);
    await weightedVoting.connect(employee2).unstake(300);

    expect(await token.balanceOf(employee1.address)).to.equal(1000);
    expect(await token.balanceOf(employee2.address)).to.equal(500);
  });
});

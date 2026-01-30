import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Choice Voting – Integration Flow", function () {
  async function deployFixture() {
    const [admin, employee1, employee2, outsider] = await ethers.getSigners();

    // Registry
    const Registry = await ethers.getContractFactory("EmployeeRegistry");
    const registry = await Registry.deploy(admin.address);

    await registry.connect(admin).addEmployee(employee1.address);
    await registry.connect(admin).addEmployee(employee2.address);

    // Wormhole mock
    const WormholeMock = await ethers.getContractFactory("WormholeMock");
    const wormhole = await WormholeMock.deploy();

    // Choice Voting
    const ChoiceVoting = await ethers.getContractFactory("ChoiceVoting");
    const choiceVoting = await ChoiceVoting.deploy(
      admin.address,
      registry.target,
    );

    return {
      admin,
      employee1,
      employee2,
      outsider,
      registry,
      wormhole,
      choiceVoting,
    };
  }

  it("runs full choice voting lifecycle with wormhole publish", async function () {
    const { admin, employee1, employee2, outsider, choiceVoting, wormhole } =
      await deployFixture();

    const now = (await ethers.provider.getBlock("latest"))!.timestamp;

    const options = [
      ethers.zeroPadValue(employee1.address, 32),
      ethers.zeroPadValue(employee2.address, 32),
    ];

    // CONFIGURE WORMHOLE (admin)
    await expect(
      choiceVoting.connect(admin).configureWormhole(wormhole.target, 1),
    )
      .to.emit(choiceVoting, "WormholeConfigured")
      .withArgs(wormhole.target, 1);

    // CREATE PROPOSAL
    await choiceVoting
      .connect(admin)
      .createProposal(now + 1, now + 100, options);

    const proposalId = 1;

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine", []);

    // VOTING
    await choiceVoting.connect(employee1).voteFor(proposalId, options[0]);
    await choiceVoting.connect(employee2).voteFor(proposalId, options[1]);

    await expect(
      choiceVoting.connect(outsider).voteFor(proposalId, options[0]),
    ).to.be.revertedWithCustomError(choiceVoting, "NotEmployee");

    // END OF VOTING PERIOD
    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);

    // CHECK RESULTS
    expect(await choiceVoting.getVotesFor(proposalId, options[0])).to.equal(1);
    expect(await choiceVoting.getVotesFor(proposalId, options[1])).to.equal(1);

    // FINALIZE (admin)
    await expect(choiceVoting.connect(admin).finalizeProposal(proposalId))
      .to.emit(wormhole, "MessagePublished")
      .withArgs(
        proposalId, // nonce
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32", "uint256"],
          [proposalId, options[0], 1],
        ),
        1, // consistency level
      )

      .to.emit(choiceVoting, "CrossChainResultPublished")
      .withArgs(
        proposalId,
        1n, // sequence (from WormholeMock)
      );
  });
});

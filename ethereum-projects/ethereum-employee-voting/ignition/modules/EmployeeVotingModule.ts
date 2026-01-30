import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EmployeeVotingModule", (m) => {
  const admin = m.getAccount(0);

  // Registry
  const registry = m.contract("EmployeeRegistry", [admin]);

  // Token (weighted voting)
  const token = m.contract("VotingToken", [admin, "Voting Token", "VOTE"]);

  // Binary voting
  const simpleBinaryVoting = m.contract("SimpleBinaryVoting", [
    admin,
    registry,
  ]);

  const weightedBinaryVoting = m.contract("WeightedBinaryVoting", [
    admin,
    registry,
    token,
    100n,
    500n,
  ]);

  // Choice voting 
  const choiceVoting = m.contract("ChoiceVoting", [
    admin,
    registry,
  ]);

  return {
    registry,
    token,
    simpleBinaryVoting,
    weightedBinaryVoting,
    choiceVoting,
  };
});

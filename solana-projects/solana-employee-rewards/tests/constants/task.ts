import { BN } from "@coral-xyz/anchor";
import { Task } from "../types/task";

export const TASK_1: Task = {
  id: 1,
  description: "Implement employee reward settlement logic",
  specUrl: "https://company-internal-docs/tasks/reward-settlement",
  points: new BN(100),
};

export const TASK_2: Task = {
  id: 2,
  description: "Add annual employee ranking calculation",
  specUrl: "https://company-internal-docs/tasks/rank-calculation",
  points: new BN(150),
};

export const TASK_3: Task = {
  id: 3,
  description: "Integrate NFT diploma minting flow",
  specUrl: "https://company-internal-docs/tasks/nft-diploma",
  points: new BN(200),
};

export const TASK_4: Task = {
  id: 4,
  description: "Implement bonus token distribution",
  specUrl: "https://company-internal-docs/tasks/bonus-token",
  points: new BN(250),
};

export const TASK_5: Task = {
  id: 5,
  description: "Add admin task management interface",
  specUrl: "https://company-internal-docs/tasks/admin-ui",
  points: new BN(300),
};

export const TASK_6: Task = {
  id: 6,
  description: "Implement task completion tracking per employee",
  specUrl: "https://company-internal-docs/tasks/task-completion-tracking",
  points: new BN(350),
};

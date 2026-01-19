import { BN } from "@coral-xyz/anchor";

export type Task = {
  id: number;
  description: string;
  specUrl: string;
  points: BN;
};

export type CreateTaskArgs = {
  taskId: number;
  description: string;
  specUrl: string;
  points: BN;
};

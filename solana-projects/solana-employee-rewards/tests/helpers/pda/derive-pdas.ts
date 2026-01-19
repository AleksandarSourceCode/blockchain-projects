import { PublicKey } from "@solana/web3.js";
import {
  GLOBAL_SEED,
  YEAR_SEED,
  TASK_SEED,
  ASSIGNMENT_SEED,
  COMPLETION_SEED,
  REWARD_MINT_SEED,
  EMPLOYEE_SEED,
  SETTLEMENT_SEED,
  SPECIAL_MINT_SEED,
  TREASURY_SEED,
  MEMBER_STATUS_NFT_SEED,
} from "../../constants/seeds";
import { u16Seed, u32Seed } from "./seed-encoding";

export function deriveGlobalConfigPda(programId: PublicKey) {
  return PublicKey.findProgramAddressSync([GLOBAL_SEED], programId);
}

export function deriveYearConfigPda(programId: PublicKey, year: number) {
  return PublicKey.findProgramAddressSync(
    [YEAR_SEED, u16Seed(year)],
    programId,
  );
}

export function deriveTaskDefinitionPda(programId: PublicKey, taskId: number) {
  return PublicKey.findProgramAddressSync(
    [TASK_SEED, u32Seed(taskId)],
    programId,
  );
}

export function deriveTaskAssignmentPda(
  programId: PublicKey,
  taskId: number,
  year: number,
) {
  return PublicKey.findProgramAddressSync(
    [ASSIGNMENT_SEED, u32Seed(taskId), u16Seed(year)],
    programId,
  );
}

export function deriveTaskCompletionPda(
  programId: PublicKey,
  employee: PublicKey,
  taskId: number,
  year: number,
) {
  return PublicKey.findProgramAddressSync(
    [COMPLETION_SEED, employee.toBuffer(), u32Seed(taskId), u16Seed(year)],
    programId,
  );
}

export function deriveRewardTokenMintPda(programId: PublicKey, year: number) {
  return PublicKey.findProgramAddressSync(
    [REWARD_MINT_SEED, u16Seed(year)],
    programId,
  );
}

export function deriveMemberStatusNftMintPda(
  programId: PublicKey,
  employee: PublicKey,
  year: number,
) {
  return PublicKey.findProgramAddressSync(
    [MEMBER_STATUS_NFT_SEED, employee.toBuffer(), u16Seed(year)],
    programId,
  );
}

export function deriveEmployeeAccountPda(
  programId: PublicKey,
  employee: PublicKey,
  year: number,
) {
  return PublicKey.findProgramAddressSync(
    [EMPLOYEE_SEED, employee.toBuffer(), u16Seed(year)],
    programId,
  );
}

export function deriveAnnualSettlementPda(
  programId: PublicKey,
  employee: PublicKey,
  year: number,
) {
  return PublicKey.findProgramAddressSync(
    [SETTLEMENT_SEED, employee.toBuffer(), u16Seed(year)],
    programId,
  );
}

export function deriveSpecialTokenMintPda(
  programId: PublicKey,
  admin: PublicKey,
) {
  return PublicKey.findProgramAddressSync(
    [SPECIAL_MINT_SEED, admin.toBuffer()],
    programId,
  );
}

export function deriveTreasuryPda(programId: PublicKey) {
  return PublicKey.findProgramAddressSync([TREASURY_SEED], programId);
}

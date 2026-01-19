import { BN } from "@coral-xyz/anchor";
import {
  MEMBER_STATUS_RANK_I_METADATA,
  MEMBER_STATUS_RANK_II_METADATA,
  MEMBER_STATUS_RANK_III_METADATA,
  MEMBER_STATUS_RANK_IV_METADATA,
} from "../fixtures/metadata";

export const POINTS_FOR_RANK_I = new BN(3500);
export const POINTS_FOR_RANK_II = new BN(2500);
export const POINTS_FOR_RANK_III = new BN(1500);
export const POINTS_FOR_RANK_IV = new BN(500);

//Maximum value for u64 (2^64 - 1)
export const U64_MAX = new BN("18446744073709551615");

//Rank I thresholds
export const RANK_IV_MIN = new BN(0);
export const RANK_IV_MAX = new BN(999);

//Rank II thresholds
export const RANK_III_MIN = new BN(1000);
export const RANK_III_MAX = new BN(1999);

//Rank III thresholds

export const RANK_II_MIN = new BN(2000);
export const RANK_II_MAX = new BN(2999);

//Rank IV thresholds
export const RANK_I_MIN = new BN(3000);
export const RANK_I_MAX = U64_MAX;

export const ranks = [
  {
    id: 1,
    minPoints: RANK_I_MIN,
    maxPoints: RANK_I_MAX,
    metadata: MEMBER_STATUS_RANK_I_METADATA,
  },
  {
    id: 2,
    minPoints: RANK_II_MIN,
    maxPoints: RANK_II_MAX,
    metadata: MEMBER_STATUS_RANK_II_METADATA,
  },
  {
    id: 3,
    minPoints: RANK_III_MIN,
    maxPoints: RANK_III_MAX,
    metadata: MEMBER_STATUS_RANK_III_METADATA,
  },
  {
    id: 4,
    minPoints: RANK_IV_MIN,
    maxPoints: RANK_IV_MAX,
    metadata: MEMBER_STATUS_RANK_IV_METADATA,
  },
];

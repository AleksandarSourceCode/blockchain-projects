import BN from "bn.js";

//u16 → 2 bytes LE
export function u16Seed(value: number): Buffer {
  return new BN(value).toArrayLike(Buffer, "le", 2);
}

//u32 → 4 bytes LE
export function u32Seed(value: number): Buffer {
  return new BN(value).toArrayLike(Buffer, "le", 4);
}

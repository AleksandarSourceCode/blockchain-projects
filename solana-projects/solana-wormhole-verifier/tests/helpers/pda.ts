import { ParsedVaaBody } from "./vaa/parse";

export type PdaMessageSeeds = {
  emitterChain: Buffer;
  emitterAddress: Buffer;
  sequence: Buffer;
};

export function toPdaMessageSeeds(body: ParsedVaaBody): PdaMessageSeeds {
  // u16 → 2 bytes LE
  const emitterChainBuf = Buffer.alloc(2);
  emitterChainBuf.writeUInt16LE(body.emitterChain, 0);

  // [u8; 32] → Buffer (already Buffer, but clone for safety)
  const emitterAddressBuf = Buffer.from(body.emitterAddress);

  // u64 → 8 bytes LE
  const sequenceBuf = Buffer.alloc(8);
  sequenceBuf.writeBigUInt64LE(body.sequence, 0);

  return {
    emitterChain: emitterChainBuf,
    emitterAddress: emitterAddressBuf,
    sequence: sequenceBuf,
  };
}

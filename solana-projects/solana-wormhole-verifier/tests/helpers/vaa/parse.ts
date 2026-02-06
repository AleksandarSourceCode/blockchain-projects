type ParsedVaa = {
  version: number;
  guardianSetIndex: number;
  signaturesCount: number;
  guardianSignaturesVec: number[][];
  vaaBody: Buffer;
};

// VAA = header | signatures | body
// header = [1] version | [4] guardianSetIndex | [1] sigCount
// signatures = [66*N] signatures
export function parseVaa(vaa: Buffer): ParsedVaa {
  const version = vaa.readUInt8(0);
  if (version !== 1) {
    throw new Error("Unsupported VAA version");
  }

  const guardianSetIndex = vaa.readUInt32BE(1);
  const signaturesCount = vaa.readUInt8(5);

  let offset = 6;
  const guardianSignaturesVec: number[][] = [];

  for (let i = 0; i < signaturesCount; i++) {
    const sig = vaa.subarray(offset, offset + 66);
    guardianSignaturesVec.push([...sig]);
    offset += 66;
  }

  const vaaBody = vaa.subarray(offset);

  return {
    version,
    guardianSetIndex,
    signaturesCount,
    guardianSignaturesVec,
    vaaBody,
  };
}

// body = [4] ts | [4] nonce | [2] emitterChain | [32] emitterAddress | [8] sequence | [1] consistency | [..] payload
export type ParsedVaaBody = {
  emitterChain: number;
  emitterAddress: Buffer;
  sequence: bigint;
  payload: Buffer;
};

export function parseVaaBody(vaaBody: Buffer): ParsedVaaBody {
  let offset = 0;

  const timestamp = vaaBody.readUInt32BE(offset);
  offset += 4;

  const nonce = vaaBody.readUInt32BE(offset);
  offset += 4;

  const emitterChain = vaaBody.readUInt16BE(offset);
  offset += 2;

  const emitterAddress = vaaBody.subarray(offset, offset + 32);
  offset += 32;

  const sequence = vaaBody.readBigUInt64BE(offset);
  offset += 8;

  const consistencyLevel = vaaBody.readUInt8(offset);
  offset += 1;

  const payload = vaaBody.subarray(offset);

  return {
    emitterChain,
    emitterAddress,
    sequence,
    payload,
  };
}

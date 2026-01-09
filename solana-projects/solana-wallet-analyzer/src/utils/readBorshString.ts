/**
 * Reads a Borsh-encoded string (u32 length prefix + UTF-8 bytes)
 * and advances the provided offset.
 */
export function readBorshString(
  data: Buffer,
  offsetRef: { value: number },
  encoding: BufferEncoding
): string
{
  const length = data.readUInt32LE(offsetRef.value);
  offsetRef.value += 4;

  const value = data
    .subarray(offsetRef.value, offsetRef.value + length)
    .toString(encoding)
    .replace(/\0/g, "")
    .trim();

  offsetRef.value += length;
  return value;
}

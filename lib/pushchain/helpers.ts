export function uuidToBigInt(id: string): bigint {
  const hex = id.replace(/-/g, "");
  if (hex.length !== 32) {
    throw new Error(`Invalid UUID provided: ${id}`);
  }
  return BigInt(`0x${hex}`);
}

export function uuidToHex(id: string): `0x${string}` {
  const hex = id.replace(/-/g, "");
  if (hex.length !== 32) {
    throw new Error(`Invalid UUID provided: ${id}`);
  }
  return `0x${hex}`;
}

export function safeUuidToBigInt(id: string): bigint | null {
  try {
    return uuidToBigInt(id);
  } catch {
    return null;
  }
}

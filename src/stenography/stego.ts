// src/utils/stego.ts

/**
 * SHA-256(certificateId) -> 32 bytes
 */
export async function hashPayloadToBytes(
  payload: string
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const data = enc.encode(payload);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuf); // 32 bytes
}

/**
 * bytes -> bit string "010101..."
 */
function bytesToBitString(bytes: Uint8Array): string {
  let bits = "";
  for (const byte of bytes) {
    let b = byte.toString(2);
    while (b.length < 8) b = "0" + b;
    bits += b;
  }
  return bits;
}

/**
 * bit string -> bytes
 */
function bitStringToBytes(bitString: string): Uint8Array {
  const byteLength = Math.floor(bitString.length / 8);
  const out = new Uint8Array(byteLength);

  for (let i = 0; i < byteLength; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | (bitString[i * 8 + j] === "1" ? 1 : 0);
    }
    out[i] = b;
  }

  return out;
}

/**
 * ENCODE (ultra-aggressive, multi-pattern):
 * - We take hashBytes (32 bytes => 256 bits)
 * - We embed it N times (numPatterns) in *disjoint* pixel sets
 * - Only blue-channel LSB is used
 *
 * Mapping:
 *   totalBits = bitsNeeded * numPatterns
 *   step = floor(totalPixels / totalBits)
 *   slotIndex = i * numPatterns + pattern
 *   pixelIndex = slotIndex * step
 */
export function embedHashDistributedBlueMulti(
  canvasEl: HTMLCanvasElement,
  hashBytes: Uint8Array,
  numPatterns = 3
): void {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvasEl;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data; // [R,G,B,A, ...]

  const bitString = bytesToBitString(hashBytes); // 256 bits
  const bitsNeeded = bitString.length;
  const totalPixels = data.length / 4;

  const totalSlots = bitsNeeded * numPatterns;

  if (totalPixels < totalSlots) {
    console.warn(
      "[stego] image too small for multi-pattern hash:",
      "pixels=", totalPixels,
      "neededSlots=", totalSlots
    );
    return;
  }

  const step = Math.floor(totalPixels / totalSlots) || 1;

  // For each pattern, embed the same bitString in a different subset of pixels
  for (let pattern = 0; pattern < numPatterns; pattern++) {
    for (let i = 0; i < bitsNeeded; i++) {
      const slotIndex = i * numPatterns + pattern;
      const pixelIndex = slotIndex * step;
      if (pixelIndex >= totalPixels) break;

      const baseIndex = pixelIndex * 4;
      const blueIndex = baseIndex + 2;

      const oldB = data[blueIndex];
      const bit = bitString[i] === "1" ? 1 : 0;

      // Only touch LSB of blue channel
      data[blueIndex] = (oldB & 0xfe) | bit;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * DECODE (multi-pattern):
 * - Using the same mapping as encoder
 * - Returns an array of hashes, one per pattern
 */
export function extractHashDistributedBlueMulti(
  canvasEl: HTMLCanvasElement,
  byteLength = 32,
  numPatterns = 3
): Uint8Array[] | null {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return null;

  const { width, height } = canvasEl;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const bitsNeeded = byteLength * 8;
  const totalPixels = data.length / 4;
  const totalSlots = bitsNeeded * numPatterns;

  if (totalPixels < totalSlots) {
    console.warn(
      "[stego] not enough pixels for multi-pattern decode:",
      "pixels=", totalPixels,
      "neededSlots=", totalSlots
    );
    return null;
  }

  const step = Math.floor(totalPixels / totalSlots) || 1;
  const results: Uint8Array[] = [];

  for (let pattern = 0; pattern < numPatterns; pattern++) {
    let bitString = "";

    for (let i = 0; i < bitsNeeded; i++) {
      const slotIndex = i * numPatterns + pattern;
      const pixelIndex = slotIndex * step;
      if (pixelIndex >= totalPixels) break;

      const baseIndex = pixelIndex * 4;
      const blueIndex = baseIndex + 2;
      const B = data[blueIndex];

      bitString += (B & 1).toString();
    }

    results.push(bitStringToBytes(bitString));
  }

  return results;
}

/**
 * Compare two byte arrays
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

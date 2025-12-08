// // src/utils/stego.ts

// /**
//  * Hash a string (here: certificateId) to 32 bytes using Web Crypto (SHA-256).
//  */
// export async function hashPayloadToBytes(payload: string): Promise<Uint8Array> {
//   const enc = new TextEncoder();
//   const data = enc.encode(payload);
//   const hashBuf = await crypto.subtle.digest("SHA-256", data);
//   return new Uint8Array(hashBuf); // 32 bytes
// }

// /**
//  * Embed fingerprint bytes into blue-channel LSBs of the canvas pixels.
//  * - data length: fingerprint.length * 8 pixels
//  * - Each bit is stored in 1 pixel's blue LSB.
//  */
// export function embedWatermarkLSB(
//   canvasEl: HTMLCanvasElement,
//   fingerprint: Uint8Array
// ): void {
//   const ctx = canvasEl.getContext("2d");
//   if (!ctx) return;

//   const { width, height } = canvasEl;
//   const imageData = ctx.getImageData(0, 0, width, height);
//   const data = imageData.data; // [R,G,B,A, R,G,B,A, ...]

//   // bytes -> bits
//   const bits: number[] = [];
//   for (const byte of fingerprint) {
//     for (let i = 7; i >= 0; i--) {
//       bits.push((byte >> i) & 1);
//     }
//   }

//   const bitsNeeded = bits.length;
//   const pixelsAvailable = data.length / 4;
//   const embedCount = Math.min(bitsNeeded, pixelsAvailable);

//   for (let i = 0; i < embedCount; i++) {
//     const baseIndex = i * 4;
//     const blueIndex = baseIndex + 2; // B channel

//     let B = data[blueIndex];
//     if (bits[i] === 1) B = B | 1; // set LSB 1
//     else B = B & 0xfe; // set LSB 0

//     data[blueIndex] = B;
//   }

//   ctx.putImageData(imageData, 0, 0);
// }

// /**
//  * Extract N bytes from blue-channel LSBs of the canvas pixels.
//  */
// export function extractWatermarkLSB(
//   canvasEl: HTMLCanvasElement,
//   byteLength = 32
// ): Uint8Array | null {
//   const ctx = canvasEl.getContext("2d");
//   if (!ctx) return null;

//   const { width, height } = canvasEl;
//   const imageData = ctx.getImageData(0, 0, width, height);
//   const data = imageData.data;

//   const bitsNeeded = byteLength * 8;
//   const pixelsAvailable = data.length / 4;
//   if (pixelsAvailable < bitsNeeded) {
//     console.warn("[stego] Not enough pixels to extract");
//     return null;
//   }

//   const bits: number[] = [];
//   for (let i = 0; i < bitsNeeded; i++) {
//     const baseIndex = i * 4;
//     const blueIndex = baseIndex + 2;
//     const B = data[blueIndex];
//     bits.push(B & 1);
//   }

//   const bytes = new Uint8Array(byteLength);
//   for (let i = 0; i < byteLength; i++) {
//     let b = 0;
//     for (let j = 0; j < 8; j++) {
//       b = (b << 1) | bits[i * 8 + j];
//     }
//     bytes[i] = b;
//   }

//   return bytes;
// }

// /**
//  * Compare two byte arrays for equality.
//  */
// export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
//   if (a.length !== b.length) return false;
//   for (let i = 0; i < a.length; i++) {
//     if (a[i] !== b[i]) return false;
//   }
//   return true;
// }

// src/utils/stego.ts

/**
 * Hash a string (certificateId) to 32 bytes using Web Crypto (SHA-256).
 */
export async function hashPayloadToBytes(payload: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const data = enc.encode(payload);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuf); // 32 bytes
}

/**
 * Embed fingerprint bytes into page as robust blocks.
 * Each bit uses a blockSize x blockSize region.
 * bit=1 => blue=255 for that block
 * bit=0 => blue=0   for that block
 */
export function embedWatermarkBlocks(
  canvasEl: HTMLCanvasElement,
  fingerprint: Uint8Array,
  blockSize = 8
): void {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvasEl;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data; // [R,G,B,A,...]

  // bytes -> bits
  const bits: number[] = [];
  for (const byte of fingerprint) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  const blocksPerRow = Math.floor(width / blockSize);
  const blocksPerCol = Math.floor(height / blockSize);
  const maxBlocks = blocksPerRow * blocksPerCol;

  if (bits.length > maxBlocks) {
    console.warn(
      "[stego] Not enough blocks to embed all bits – increase page size or decrease blockSize"
    );
  }

  const totalBits = Math.min(bits.length, maxBlocks);

  for (let i = 0; i < totalBits; i++) {
    const bit = bits[i];

    const blockRow = Math.floor(i / blocksPerRow);
    const blockCol = i % blocksPerRow;

    const startX = blockCol * blockSize;
    const startY = blockRow * blockSize;

    const blueValue = bit ? 255 : 0;

    for (let by = 0; by < blockSize; by++) {
      const y = startY + by;
      if (y >= height) break;
      for (let bx = 0; bx < blockSize; bx++) {
        const x = startX + bx;
        if (x >= width) break;

        const idx = (y * width + x) * 4;
        // keep R,G,A same; only change B
        data[idx + 2] = blueValue;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Extract byteLength bytes from the blue-block pattern.
 */
export function extractWatermarkBlocks(
  canvasEl: HTMLCanvasElement,
  byteLength = 32,
  blockSize = 8
): Uint8Array | null {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return null;

  const { width, height } = canvasEl;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const bitsNeeded = byteLength * 8;

  const blocksPerRow = Math.floor(width / blockSize);
  const blocksPerCol = Math.floor(height / blockSize);
  const maxBlocks = blocksPerRow * blocksPerCol;

  if (maxBlocks < bitsNeeded) {
    console.warn("[stego] Not enough blocks to extract");
    return null;
  }

  const bits: number[] = [];

  for (let i = 0; i < bitsNeeded; i++) {
    const blockRow = Math.floor(i / blocksPerRow);
    const blockCol = i % blocksPerRow;

    const startX = blockCol * blockSize;
    const startY = blockRow * blockSize;

    let sumB = 0;
    let count = 0;

    for (let by = 0; by < blockSize; by++) {
      const y = startY + by;
      if (y >= height) break;
      for (let bx = 0; bx < blockSize; bx++) {
        const x = startX + bx;
        if (x >= width) break;

        const idx = (y * width + x) * 4;
        const B = data[idx + 2];
        sumB += B;
        count++;
      }
    }

    const avgB = count ? sumB / count : 0;
    const bit = avgB > 127 ? 1 : 0;
    bits.push(bit);
  }

  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    bytes[i] = b;
  }

  return bytes;
}

/**
 * Compare two byte arrays for equality.
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

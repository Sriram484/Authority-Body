// Minimal CRC32 implementation for PNG chunks
function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

/**
 * Embed certificateId into PNG as a tEXt chunk with keyword "certificateId"
 * Input/Output: data URL string ("data:image/png;base64,...")
 */
export function embedCertificateIdInPngDataUrl(
  dataUrl: string,
  certificateId: string
): string {
  const prefix = "data:image/png;base64,";
  const base64 = dataUrl.startsWith(prefix)
    ? dataUrl.slice(prefix.length)
    : dataUrl;

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // PNG signature (8 bytes)
  const pngSig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < pngSig.length; i++) {
    if (bytes[i] !== pngSig[i]) {
      console.warn("[png-meta] Not a PNG file");
      return dataUrl;
    }
  }

  // We'll insert tEXt chunk before IEND
  let offset = 8; // after signature
  let iendOffset = -1;

  while (offset < bytes.length) {
    const length =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];
    const typeStart = offset + 4;
    const typeEnd = typeStart + 4;
    const dataStart = typeEnd;
    const dataEnd = dataStart + length;
    const crcStart = dataEnd;
    const crcEnd = crcStart + 4;

    const typeStr = String.fromCharCode(
      bytes[typeStart],
      bytes[typeStart + 1],
      bytes[typeStart + 2],
      bytes[typeStart + 3]
    );

    if (typeStr === "IEND") {
      iendOffset = offset;
      break;
    }

    offset = crcEnd;
  }

  if (iendOffset < 0) {
    console.warn("[png-meta] IEND not found");
    return dataUrl;
  }

  // Build tEXt chunk: "certificateId\0<certificateId>"
  const keyword = "certificateId";
  const textDataStr = keyword + "\0" + certificateId;
  const textDataBytes = new TextEncoder().encode(textDataStr);

  const length = textDataBytes.length;
  const chunkTypeBytes = new TextEncoder().encode("tEXt");

  const chunk = new Uint8Array(4 + 4 + length + 4);
  // length
  chunk[0] = (length >>> 24) & 0xff;
  chunk[1] = (length >>> 16) & 0xff;
  chunk[2] = (length >>> 8) & 0xff;
  chunk[3] = length & 0xff;

  // type
  chunk.set(chunkTypeBytes, 4);

  // data
  chunk.set(textDataBytes, 8);

  // CRC over type + data
  const crcInput = new Uint8Array(4 + length);
  crcInput.set(chunkTypeBytes, 0);
  crcInput.set(textDataBytes, 4);
  const crc = crc32(crcInput);

  const crcOffset = 8 + length;
  chunk[crcOffset] = (crc >>> 24) & 0xff;
  chunk[crcOffset + 1] = (crc >>> 16) & 0xff;
  chunk[crcOffset + 2] = (crc >>> 8) & 0xff;
  chunk[crcOffset + 3] = crc & 0xff;

  // New PNG = [before IEND] + [tEXt chunk] + [from IEND to end]
  const before = bytes.slice(0, iendOffset);
  const after = bytes.slice(iendOffset);

  const combined = new Uint8Array(before.length + chunk.length + after.length);
  combined.set(before, 0);
  combined.set(chunk, before.length);
  combined.set(after, before.length + chunk.length);

  // back to base64 data URL
  let outBin = "";
  for (let i = 0; i < combined.length; i++) {
    outBin += String.fromCharCode(combined[i]);
  }
  const outBase64 = btoa(outBin);
  return prefix + outBase64;
}

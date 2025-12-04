// utils/attachmentUtils.ts
export function normalizeToDataUrl(
  base64OrDataUrl: string | null | undefined,
  mimeType?: string
): string | null {
  if (!base64OrDataUrl) return null;
  if (base64OrDataUrl.startsWith("data:")) return base64OrDataUrl;
  // assume raw base64 payload -> attach mime if provided, default to application/octet-stream
  const mime = mimeType ?? "application/octet-stream";
  return `data:${mime};base64,${base64OrDataUrl}`;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const meta = parts[0]; // e.g. data:application/pdf;base64
  const base64 = parts[1] ?? "";
  const isBase64 = meta.indexOf(";base64") !== -1;
  if (!isBase64) {
    // data is raw URI encoded
    const raw = decodeURIComponent(parts[1] ?? "");
    return new Blob([raw], {
      type: meta.split(":")[1] ?? "application/octet-stream",
    });
  }
  const binary = atob(base64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
  const mime =
    (meta.split(":")[1] || "").split(";")[0] || "application/octet-stream";
  return new Blob([u8], { type: mime });
}

export function base64ToPdfBlob(base64: string): Blob {
  // convenience if you know it's a PDF base64 without prefix
  return dataUrlToBlob(`data:application/pdf;base64,${base64}`);
}

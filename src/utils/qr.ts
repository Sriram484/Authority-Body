// lib/qr.ts
import QRCode from "qrcode";

export async function generateQrDataUrl(content: string): Promise<string> {
  // returns a PNG data URL like "data:image/png;base64,..."
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: "H",
    margin: 1,
    scale: 6, // size – you can tweak
  });
}

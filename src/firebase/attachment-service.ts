// src/firebase/attachment-service.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-config";

export type AttachmentDoc = {
  id: string;
  filename?: string | null;
  mimeType?: string | null;   // e.g. "application/pdf"
  base64?: string | null;     // raw base64 (no data: prefix)
  dataUrl?: string | null;    // full data URL if you stored it
  size?: number | null;       // in bytes
  createdAt?: any;
};

/**
 * Fetch a single attachment from `attachments` collection by ID.
 * This supports both:
 *  - base64 field
 *  - dataUrl field
 */
export async function fetchAttachmentDocById(
  id: string
): Promise<AttachmentDoc | null> {
  if (!id) return null;

  try {
    const ref = doc(db, "attachments", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data() as any;

    return {
      id: snap.id,
      filename: data.filename ?? data.name ?? null,
      mimeType: data.mimeType ?? data.type ?? null,
      base64: data.base64 ?? null,
      dataUrl: data.dataUrl ?? null,
      size: data.size ?? null,
      createdAt: data.createdAt ?? null,
    };
  } catch (err) {
    console.error("fetchAttachmentDocById error:", err);
    return null;
  }
}

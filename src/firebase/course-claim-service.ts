// src/services/course-claim-service.ts
import {
  collection,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  QueryDocumentSnapshot,
  where,
  query,
} from "firebase/firestore";

import { db } from "./firebase-config";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface CourseClaimRequest {
  id: string;
  courseId: string;
  courseTitle: string;
  agencyId: string;
  agencyName: string;
  status: string;
  submittedDate: string;
  reviewedDate?: string | null;
  notes?: string;
  rationale?: string;
  rejectionComments?: string;
  documents: Attachment[];
  aaIds: string[];
  abIds: string[];
}

const formatDate = (ts: any): string => {
  if (!ts) return "";
  // Firestore Timestamp
  if (typeof ts.toDate === "function") {
    return ts.toDate().toISOString().split("T")[0];
  }
  // ISO string or Date
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toISOString().split("T")[0];
};

const normalizeClaim = (snap: QueryDocumentSnapshot): CourseClaimRequest => {
  const raw: any = snap.data();

  return {
    id: snap.id,
    courseId: raw.courseId,
    courseTitle: raw.courseName || raw.courseTitle || "Untitled Course",
    agencyId:
      Array.isArray(raw.aaIds) && raw.aaIds.length > 0
        ? raw.aaIds[0]
        : raw.createdBy,
    agencyName: raw.agencyName || raw.createdBy || "Unknown Agency",
    status: raw.status || "pending",
    submittedDate: formatDate(raw.createdAt || raw.requestedAt),
    reviewedDate: raw.reviewedAt ? formatDate(raw.reviewedAt) : null,
    notes: raw.notes || "",
    rationale: raw.rationale || "",
    rejectionComments: raw.rejectionComments || "",
    documents: Array.isArray(raw.attachments) ? raw.attachments : [],
    aaIds: Array.isArray(raw.aaIds) ? raw.aaIds : [],
    abIds: Array.isArray(raw.abIds) ? raw.abIds : [],
  };
};

/**
 * Get all course claim requests
 */
export async function getCourseClaimRequests(
  abId: string
): Promise<CourseClaimRequest[]> {
  console.log("@###", abId);
  if (!abId) return []; // no AB id → no claims

  const colRef = collection(db, "courseRequests");
  const q = query(colRef, where("abIds", "array-contains", abId));
  const snap = await getDocs(q);
  return snap.docs.map(normalizeClaim);
}

/**
 * Approve a claim:
 *  1. Add AA id to the course's aaIds array
 *  2. Delete the claim document from courseRequests
 */
export async function approveCourseClaimRequest(
  claimId: string,
  abId: string
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const claimRef = doc(db, "courseRequests", claimId);
    const claimSnap = await tx.get(claimRef);
    if (!claimSnap.exists()) {
      throw new Error("Claim not found");
    }

    const claim: any = claimSnap.data();

    // ✅ security: only if this AB is assigned
    if (!Array.isArray(claim.abIds) || !claim.abIds.includes(abId)) {
      throw new Error("You are not authorised to approve this claim");
    }

    const courseId: string = claim.courseId;
    if (!courseId) {
      throw new Error("Claim does not have courseId");
    }

    const courseRef = doc(db, "courses", courseId);

    const aaId =
      Array.isArray(claim.aaIds) && claim.aaIds.length > 0
        ? claim.aaIds[0]
        : claim.createdBy;

    tx.update(courseRef, {
      aaIds: arrayUnion(aaId),
      updatedAt: serverTimestamp(),
    });

    tx.delete(claimRef);
  });
}

/**
 * Reject a claim:
 *  1. Set status = 'rejected'
 *  2. Add rejectionComments
 *  3. Append to timeline (optional) for audit
 */
export async function rejectCourseClaimRequest(
  claimId: string,
  remarks: string,
  reviewerName: string,
  abId: string
): Promise<CourseClaimRequest> {
  const claimRef = doc(db, "courseRequests", claimId);
  const snap = await getDoc(claimRef);

  if (!snap.exists()) {
    throw new Error("Claim not found");
  }

  const claim: any = snap.data();
  if (!Array.isArray(claim.abIds) || !claim.abIds.includes(abId)) {
    throw new Error("You are not authorised to reject this claim");
  }

  const timelineEntry = {
    id: `t-${Date.now()}`,
    type: "rejected",
    actor: reviewerName,
    message: remarks,
    createdAt: new Date(),
  };

  await updateDoc(claimRef, {
    status: "rejected",
    rejectionComments: remarks,
    updatedAt: serverTimestamp(),
    timeline: arrayUnion(timelineEntry),
  });

  const updatedSnap = await getDoc(claimRef);
  if (!updatedSnap.exists()) {
    throw new Error("Claim not found after update");
  }
  return normalizeClaim(updatedSnap as any);
}

// src/firebase/attachment-service.ts
export type AttachmentDoc = {
  id: string;
  filename?: string | null;
  mimeType?: string | null; // optional stored MIME type
  base64?: string | null; // raw base64 (without data: prefix) OR
  dataUrl?: string | null; // full data URL like data:application/pdf;base64,...
  size?: number | null;
  createdAt?: any;
};

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
    throw err;
  }
}

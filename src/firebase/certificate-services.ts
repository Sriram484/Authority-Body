// src/firebase/certificate-service.ts
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  DocumentData,
  writeBatch,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase-config";

/** Types **/
export interface AttachmentRecord {
  id: string;
  base64?: string; // base64 without data: prefix OR full data URL
  dataUrl?: string; // optional full data URL
  mime?: string;
  filename?: string;
  sizeBytes?: number;
  createdAt?: any;
  [k: string]: any;
}

export interface CertificateRequestDoc {
  id: string;
  courseId?: string | null;
  courseTitle?: string | null;
  studentId?: string | null;
  studentName?: string | null;
  studentEmail?: string | null;
  agencyUserId?: string | null;
  agencyName?: string | null;
  status?: string;
  submittedAt?: any;
  reviewedAt?: any;
  notes?: string | null;
  rationale?: string | null;
  rejectionComments?: string | null;
  attachments?: { id: string; name?: string; type?: string; size?: number }[];
  [k: string]: any;
}

// src/firebase/certificate-request-service.ts

/** Load all CertificateApprovalRequest docs (non-paginated),
 * and enrich with student & course names.
 */
// src/firebase/certificate-request-service.ts

export async function getCertificateRequests(): Promise<
  CertificateRequestDoc[]
> {
  const col = collection(db, "CertificateApprovalRequest");
  const snap = await getDocs(col);

  // 1) Normalize base requests
  const baseRequests: CertificateRequestDoc[] = snap.docs.map((d) =>
    normalizeRequestDoc(d.id, d.data())
  );
  if (baseRequests.length === 0) return [];

  // 2) Collect IDs for joins
  const studentIds = Array.from(
    new Set(
      baseRequests
        .map((r) => r.studentId)
        .filter((id): id is string => !!id)
    )
  );
  const courseIds = Array.from(
    new Set(
      baseRequests
        .map((r) => r.courseId)
        .filter((id): id is string => !!id)
    )
  );
  const agencyIds = Array.from(
    new Set(
      baseRequests
        .map((r) => r.agencyUserId)
        .filter((id): id is string => !!id)
    )
  );

  /* ---------- Students join (students collection) ---------- */

  type StudentRecord = { fullName?: string; email?: string };
  const studentsMap = new Map<string, StudentRecord>();

  if (studentIds.length > 0) {
    const studentsCol = collection(db, "students"); // matches your schema
    for (let i = 0; i < studentIds.length; i += 10) {
      const chunk = studentIds.slice(i, i + 10); // Firestore 'in' max 10
      const qSt = query(studentsCol, where("__name__", "in", chunk));
      const stSnap = await getDocs(qSt);
      stSnap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        studentsMap.set(docSnap.id, {
          fullName: data.fullName || data.name || "",
          email: data.email || "",
        });
      });
    }
  }

  /* ---------- Courses join (courses collection) ---------- */

  type CourseRecord = { courseName?: string };
  const coursesMap = new Map<string, CourseRecord>();

  if (courseIds.length > 0) {
    const coursesCol = collection(db, "courses");
    for (let i = 0; i < courseIds.length; i += 10) {
      const chunk = courseIds.slice(i, i + 10);
      const qCr = query(coursesCol, where("__name__", "in", chunk));
      const crSnap = await getDocs(qCr);
      crSnap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        coursesMap.set(docSnap.id, {
          courseName: data.courseName || data.name || "",
        });
      });
    }
  }

  /* ---------- Agencies join (Assessment_Agencies collection) ---------- */

  type AgencyRecord = { organisation?: string; name?: string };
  const agenciesMap = new Map<string, AgencyRecord>();

  if (agencyIds.length > 0) {
    const agenciesCol = collection(db, "Assessment_Agencies");
    for (let i = 0; i < agencyIds.length; i += 10) {
      const chunk = agencyIds.slice(i, i + 10);
      const qAg = query(agenciesCol, where("__name__", "in", chunk));
      const agSnap = await getDocs(qAg);
      agSnap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        agenciesMap.set(docSnap.id, {
          organisation: data.organisation || "",
          name: data.name || "",
        });
      });
    }
  }

  /* ---------- Enrich base requests with names ---------- */

  const enriched: CertificateRequestDoc[] = baseRequests.map((r) => {
    const studentInfo = r.studentId ? studentsMap.get(r.studentId) : undefined;
    const courseInfo = r.courseId ? coursesMap.get(r.courseId) : undefined;
    const agencyInfo = r.agencyUserId
      ? agenciesMap.get(r.agencyUserId)
      : undefined;

    return {
      ...r,
      studentName:
        r.studentName ?? studentInfo?.fullName ?? null,
      studentEmail:
        r.studentEmail ?? studentInfo?.email ?? null,
      courseTitle:
        r.courseTitle ?? courseInfo?.courseName ?? null,
      agencyName:
        r.agencyName ??
        agencyInfo?.organisation ??
        agencyInfo?.name ??
        null,
    };
  });

  return enriched;
}



/** Normalize a raw doc into our UI-friendly type */
export function normalizeRequestDoc(
  id: string,
  raw: DocumentData
): CertificateRequestDoc {
  const attachments =
    Array.isArray(raw.attachments) && raw.attachments.length > 0
      ? raw.attachments.map((a: any) => ({
        id: a.id,
        name: a.name ?? a.filename ?? null,
        type: a.type ?? a.mime ?? null,
        size: a.size ?? null,
      }))
      : Array.isArray(raw.documents)
        ? raw.documents.map((a: any) => ({
          id: a.id,
          name: a.name ?? a.filename ?? null,
          type: a.type ?? a.mime ?? null,
          size: a.size ?? null,
        }))
        : [];

  return {
    id,
    courseId: raw.courseId ?? null,
    courseTitle: raw.courseTitle ?? raw.courseName ?? null,
    studentId: raw.studentId ?? null,
    studentName:
      raw.studentName ?? (raw.student && raw.student.fullName) ?? null,
    studentEmail:
      raw.studentEmail ?? (raw.student && raw.student.email) ?? null,
    agencyUserId: raw.agencyUserId ?? raw.agencyId ?? null,
    agencyName: raw.agencyName ?? null,
    status: (raw.status ?? "pending").toString(),
    submittedAt: raw.submittedAt ?? raw.createdAt ?? null,
    reviewedAt: raw.reviewedAt ?? null,
    notes: raw.notes ?? raw.rationale ?? null,
    rationale: raw.rationale ?? raw.notes ?? null,
    rejectionComments: raw.rejectionComments ?? raw.remark ?? null,
    attachments,
    ...raw,
  } as CertificateRequestDoc;
}

/**
 * Update status + comment (approve/reject) of a certificate request.
 * Partial update using updateDoc (keeps other fields intact).
 */
export async function updateCertificateRequestStatus(
  requestId: string,
  updates: {
    status?: string;
    rejectionComments?: string | null;
    reviewedAt?: any;
  }
) {
  if (!requestId) throw new Error("requestId required");
  const ref = doc(db, "CertificateApprovalRequest", requestId);
  const payload: any = { updatedAt: serverTimestamp() };
  if (updates.status) payload.status = updates.status;
  if (updates.rejectionComments !== undefined)
    payload.rejectionComments = updates.rejectionComments;
  if (updates.reviewedAt) payload.reviewedAt = updates.reviewedAt;
  await updateDoc(ref, payload);
  return true;
}

export async function acceptCertificateRequest({
  requestId,
  acceptedId, // optional: if provided, will use as the target id, otherwise uses requestId
  reviewerName,
  reviewedAt, // string or timestamp - optional
  studentId,
}: {
  requestId: string;
  acceptedId?: string | null;
  reviewerName?: string | null;
  reviewedAt?: string | null;
  studentId?: string | "";
}) {
  if (!requestId) throw new Error("requestId required");

  // read source doc
  const sourceRef = doc(db, "CertificateApprovalRequest", requestId);
  const srcSnap = await getDoc(sourceRef);
  if (!srcSnap.exists()) throw new Error("Source request not found");

  const srcData = srcSnap.data() ?? {};

  // prepare accepted payload (you can shape fields as you like)
  const acceptedPayload: any = {
    // copy over the main identifying fields
    ...srcData,

    // normalize status fields for accepted collection
    status: "approved",
    reviewedAt: reviewedAt ?? srcData.reviewedAt ?? serverTimestamp(),
    acceptedAt: serverTimestamp(),
    acceptedBy: reviewerName ?? null,
    studentId: studentId,
    // ensure metadata timestamps are set
    updatedAt: serverTimestamp(),
    // remove any fields you don't want persisted to accepted collection here, if any
  };

  // target doc ref (use same id to keep traceability, or pass different acceptedId)
  const finalAcceptedId = acceptedId ?? requestId;
  const targetRef = doc(db, "AcceptedCertificates", finalAcceptedId);

  // perform batch: set accepted doc, delete original request doc
  const batch = writeBatch(db);
  batch.set(targetRef, acceptedPayload, { merge: true });
  batch.delete(sourceRef);
  const studentRef = doc(db, "students", studentId!);
  batch.set(
    studentRef,
    {
      certificateIds: arrayUnion(finalAcceptedId),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
  console.log(studentId);

  return { acceptedId: finalAcceptedId };
}

/**
 * Fetch an attachment record from `attachments` collection by id.
 * Expected record shape:
 * { base64: "<base64>" OR dataUrl: "data:...", mime: "application/pdf", filename: "x.pdf", ... }
 */
export async function fetchAttachmentRecord(
  attachmentId: string
): Promise<AttachmentRecord | null> {
  if (!attachmentId) return null;
  const ref = doc(db, "attachments", attachmentId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as AttachmentRecord;
  } catch (err) {
    console.error("fetchAttachmentRecord error:", err);
    return null;
  }
}

/** Optional helper to add an attachment record (if you want service to save base64) */
export async function saveAttachmentRecord(payload: Partial<AttachmentRecord>) {
  const col = collection(db, "attachments");
  const docRef = await addDoc(col, {
    ...payload,
    createdAt: serverTimestamp(),
  });
  // return id and snapshot-like object
  return { id: docRef.id };
}

/** Optional: create request doc (if needed elsewhere) */
export async function createCertificateApprovalRequest(
  minimalPayload: Partial<CertificateRequestDoc>
) {
  const col = collection(db, "CertificateApprovalRequest");
  const docRef = await addDoc(col, {
    ...minimalPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: minimalPayload.status ?? "pending",
  });
  return { id: docRef.id };
}

// src/firebase/agency-service.ts
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase-config";


const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Agency {
  id: string;
  name: string;
  adminEmail: string;
  location: string;
  phone: string;
  website: string;
  coursesOffered: string[];
  status: string;
  registeredDate: string;
  totalCertificates: number;
}

export interface AgencyInput {
  name: string;
  adminEmail: string;
  location: string;
  phone?: string;
  website?: string;
  coursesOffered: string[];
}

// helper to normalize dates
const toDateOnly = (val: any): string => {
  if (!val) return "";
  if (typeof val.toDate === "function") {
    return val.toDate().toISOString().split("T")[0];
  }
  const d = val instanceof Date ? val : new Date(val);
  return d.toISOString().split("T")[0];
};

const normalizeAgency = (snap: QueryDocumentSnapshot | any): Agency => {
  const raw: any = snap.data();

  return {
    id: snap.id,
    name: raw.organisation || raw.name || "Unnamed Agency",
    adminEmail: raw.email || raw.adminEmail || "",
    location: raw.location || "",
    phone: raw.phone || "",
    website: raw.website || "",
    coursesOffered: Array.isArray(raw.coursesOffered)
      ? raw.coursesOffered
      : [],
    status: raw.status || "Active",
    registeredDate: raw.createdAt
      ? toDateOnly(raw.createdAt)
      : toDateOnly(raw.registeredDate),
    totalCertificates:
      typeof raw.totalCertificates === "number"
        ? raw.totalCertificates
        : 0,
  };
};

/**
 * Get all Assessment_Agencies linked to an Authority Body
 * using Authority_Bodies/{authorityUid}.AssessmentAgencyIds
 */
export async function getAgenciesForAuthority(
  authorityUid: string
): Promise<Agency[]> {
    
  if (!authorityUid) return [];

  const abRef = doc(db, "Authority_Bodies", authorityUid);
  const abSnap = await getDoc(abRef);
  if (!abSnap.exists()) return [];
  
  const abData: any = abSnap.data();
  const agencyIds: string[] = Array.isArray(abData.AssessmentAgencyIds)
    ? abData.AssessmentAgencyIds
    : [];

    
  if (agencyIds.length === 0) return [];

  const docs = await Promise.all(
    agencyIds.map((id) => getDoc(doc(db, "Assessment_Agencies", id)))
  );

  return docs
    .filter((d) => d.exists())
    .map((d) => normalizeAgency(d as any));
}

/**
 * Create a new assessment agency via backend:
 *  - creates Auth user
 *  - creates Assessment_Agencies doc (id = uid)
 *  - links uid in Authority_Bodies.AssessmentAgencyIds
 */
export async function createAgencyForAuthority(
  authorityUid: string,
  input: AgencyInput
): Promise<Agency> {
  if (!authorityUid) {
    throw new Error("authorityUid is required");
  }

  const body = {
    email: input.adminEmail,
    organisation: input.name,
    authorityUid,
    // optional: send custom temp password or let backend default
    // password: "SomeTemp#123",
  };

  const res = await fetch(`${API_BASE}/api/create-assessment-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody.error || `Failed to create assessment admin (status ${res.status})`
    );
  }

  const data = await res.json();
  const uid: string = data.uid;
  const agencyDoc: any = data.agencyDoc || {};

  // Build a fake snapshot so we can reuse normalizeAgency
  const fakeSnap = {
    id: uid,
    data: () => ({
      ...agencyDoc,
      // include location/phone/website if user typed those in UI
      location: input.location,
      phone: input.phone || "",
      website: input.website || "",
      coursesOffered: input.coursesOffered,
    }),
  };

  return normalizeAgency(fakeSnap as any);
}


/**
 * Update an existing Assessment_Agencies document (only profile fields).
 */
export async function updateAgency(
  agencyId: string,
  input: AgencyInput
): Promise<Agency> {
  const ref = doc(db, "Assessment_Agencies", agencyId);

  const payload: any = {
    organisation: input.name,
    email: input.adminEmail,
    location: input.location,
    phone: input.phone || "",
    website: input.website || "",
    coursesOffered: input.coursesOffered,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(ref, payload);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Agency not found after update");
  }
  return normalizeAgency(snap as any);
}

/**
 * Delete agency:
 *  - remove from Authority_Bodies.AssessmentAgencyIds
 *  - delete Assessment_Agencies/{agencyId}
 */
export async function deleteAgencyForAuthority(
  authorityUid: string,
  agencyId: string
): Promise<void> {
  if (!authorityUid || !agencyId) return;

  const abRef = doc(db, "Authority_Bodies", authorityUid);
  const agencyRef = doc(db, "Assessment_Agencies", agencyId);

  // unlink and delete
  await updateDoc(abRef, {
    AssessmentAgencyIds: arrayRemove(agencyId),
    updatedAt: serverTimestamp(),
  });

  await deleteDoc(agencyRef);
}


// ---------------- AUTH + BACKEND INTEGRATION ----------------

/**
 * Update the Firebase Auth user's email for an assessment agency.
 * Backend route: POST /update-assessment-admin-email
 * Body: { agencyId, newEmail }
 */
export async function updateAgencyAuthEmail(
  agencyId: string,
  newEmail: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/update-assessment-admin-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agencyId, newEmail }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Failed to update auth email (status ${res.status})`
    );
  }
}

/**
 * Delete the Firebase Auth user + Firestore links for an assessment agency.
 * Backend route: POST /delete-assessment-admin
 * Body: { agencyId, authorityUid }
 */
export async function deleteAgencyAuth(
  agencyId: string,
  authorityUid: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/delete-assessment-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agencyId, authorityUid }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Failed to delete agency auth user (status ${res.status})`
    );
  }
}

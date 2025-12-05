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
  getDocs,
  query,
  where,
  setDoc,                 // 👈 ADD THIS
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
 * using Assessment_Agencies.authorityBodyIds contains authorityUid
 */
export async function getAgenciesForAuthority(
  authorityUid: string
): Promise<Agency[]> {
  if (!authorityUid) return [];

  const q = query(
    collection(db, "Assessment_Agencies"),
    where("authorityBodyIds", "array-contains", authorityUid)
  );

  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => normalizeAgency(d as any));
}

/**
 * Create a new assessment agency via backend:
 *  - backend creates Auth user + basic Assessment_Agencies doc
 *  - here we patch location/phone/website/coursesOffered into that doc
 */
export async function createAgencyForAuthority(
  authorityUid: string,
  input: AgencyInput
): Promise<Agency> {
  if (!authorityUid) {
    throw new Error("authorityUid is required");
  }

  // 1) Ask backend to create auth user + base agency doc
  const body = {
    email: input.adminEmail,
    organisation: input.name,
    authorityUid,
    // you can optionally pass temp password etc
  };

  const res = await fetch(`${API_BASE}/api/create-assessment-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody.error ||
        `Failed to create assessment admin (status ${res.status})`
    );
  }

  const data = await res.json();
  const uid: string = data.uid;

  // 2) Patch extra fields into Assessment_Agencies/{uid}
  const agencyRef = doc(db, "Assessment_Agencies", uid);

  await setDoc(
    agencyRef,
    {
      // profile fields from UI
      organisation: input.name,
      email: input.adminEmail,
      location: input.location,
      phone: input.phone || "",
      website: input.website || "",
      coursesOffered: input.coursesOffered || [],
      updatedAt: serverTimestamp(),
    },
    { merge: true } // 👈 merge so we don't overwrite what backend set
  );

  // 3) Read the final doc from Firestore and normalize
  const snap = await getDoc(agencyRef);
  if (!snap.exists()) {
    throw new Error("Agency not found after creation");
  }

  return normalizeAgency(snap as any);
}


/**
 * Update an existing Assessment_Agencies document (only profile fields).
 */
export async function updateAgency(
  agencyId: string,
  input: AgencyInput
): Promise<Agency> {
  const ref = doc(db, "Assessment_Agencies", agencyId);

  console.log("Updating agency:", agencyId, input);

  const payload: any = {
    organisation: input.name,
    email: input.adminEmail,
    location: input.location,
    phone: input.phone || "",
    website: input.website || "",
    coursesOffered: input.coursesOffered,
    updatedAt: serverTimestamp(),
  };

  console.log("Updating agency with payload:", payload);

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

  const agencyRef = doc(db, "Assessment_Agencies", agencyId);

  // 1) unlink this AB from the agency's authorityBodyIds
  await updateDoc(agencyRef, {
    authorityBodyIds: arrayRemove(authorityUid),
    updatedAt: serverTimestamp(),
  });

  // 2) delete the agency doc itself
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

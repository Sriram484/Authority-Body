// src/firebase/course-service.ts
import {
  collection,
  getDocs,
  query,
  where,
  QueryDocumentSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  runTransaction,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";

/** Firestore Course shape */
export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  nsqfLevel: number | null;
  aaIds: string[];
  abIds: string[];
  description: string;
  tags: string[];         // 👈 UI badges (built from comma string in form)
  duration: string;
  level: string;          // Beginner / Intermediate / Advanced / etc
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseCreateInput {
  courseName: string;
  nsqfLevel?: number | null;
  description?: string;
  tags?: string[];
  duration?: string;
  level?: string;
}

export interface CourseUpdateInput {
  courseName?: string;
  nsqfLevel?: number | null;
  description?: string;
  tags?: string[];
  duration?: string;
  level?: string;
  abIds?: string[];
  aaIds?: string[];
}

/* ---------- helpers ---------- */

const toIso = (val: any | undefined): string | undefined => {
  if (!val) return undefined;
  if (typeof val.toDate === "function") {
    return val.toDate().toISOString();
  }
  const d = val instanceof Date ? val : new Date(val);
  return d.toISOString();
};

const normalizeCourse = (snap: QueryDocumentSnapshot | any): Course => {
  const raw: any = snap.data();

  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags;
  } else if (typeof raw.tags === "string") {
    // support tags stored as comma-separated string
    tags = raw.tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
  }

  return {
    id: snap.id,
    courseName: raw.courseName || "Untitled Course",
    courseCode: raw.courseCode || "",
    nsqfLevel: typeof raw.nsqfLevel === "number" ? raw.nsqfLevel : null,
    aaIds: Array.isArray(raw.aaIds) ? raw.aaIds : [],
    abIds: Array.isArray(raw.abIds) ? raw.abIds : [],
    description: raw.description || "",
    tags,
    duration: raw.duration || "",
    level: raw.level || "",
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
  };
};

/** Get AB “code” (like "ab203") from Authority_Bodies/{abUid} */
async function getAuthorityCode(abUid: string): Promise<string | null> {
  if (!abUid) return null;
  const abRef = doc(db, "Authority_Bodies", abUid);
  const abSnap = await getDoc(abRef);
  if (!abSnap.exists()) return null;
  const data: any = abSnap.data();
  return data.abId || null; // e.g. "ab203"
}

/* ---------- READ: list courses for an Authority Body ---------- */

export async function getCoursesForAuthority(
  abUid: string
): Promise<Course[]> {
  const abCode = await getAuthorityCode(abUid);
  if (!abCode) return [];

  const colRef = collection(db, "courses");
  const q = query(colRef, where("abIds", "array-contains", abCode));
  const snap = await getDocs(q);

  return snap.docs.map(normalizeCourse);
}

/* ---------- READ: courses for a specific agency + AB ---------- */

export async function getCoursesForAgency(
  agencyUid: string,
  authorityBodyIds: string[]
): Promise<Course[]> {
  if (!agencyUid) return [];

  const colRef = collection(db, "courses");
  const q = query(colRef, where("aaIds", "array-contains", agencyUid));
  const snap = await getDocs(q);

  const authorityIdsSet = new Set(authorityBodyIds || []);

  return snap.docs
    .map(normalizeCourse)
    .filter((course) => course.abIds.some((id) => authorityIdsSet.has(id)));
}

/* ---------- AGENCY ↔ COURSE LINKS (aaIds) ---------- */

export async function addAgencyToCourse(
  agencyId: string,
  courseId: string
): Promise<void> {
  const courseRef = doc(db, "courses", courseId);
  await updateDoc(courseRef, {
    aaIds: arrayUnion(agencyId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeAgencyFromCourse(
  agencyId: string,
  courseId: string
): Promise<void> {
  const courseRef = doc(db, "courses", courseId);
  await updateDoc(courseRef, {
    aaIds: arrayRemove(agencyId),
    updatedAt: serverTimestamp(),
  });
}

/* ---------- CREATE: only for this AB ---------- */

export async function createCourseForAuthority(
  abUid: string,
  input: CourseCreateInput
): Promise<Course> {
  const abCode = await getAuthorityCode(abUid);
  if (!abCode) {
    throw new Error("Authority Body code (abId) not found");
  }

  const colRef = collection(db, "courses");
  const courseRef = doc(colRef);
  const now = new Date().toISOString();

  const generateCode = () =>
    Math.random().toString(36).substring(2, 7).toUpperCase();

  const docData = {
    id: courseRef.id,
    courseName: input.courseName,
    courseCode: generateCode(),
    nsqfLevel:
      typeof input.nsqfLevel === "number" ? input.nsqfLevel : null,
    abIds: [abCode],
    aaIds: [],
    description: input.description || "",
    // store as array; you typed comma string in UI
    tags: input.tags || [],
    duration: input.duration || "",
    level: input.level || "",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(courseRef, docData);
  const snap = await getDoc(courseRef);
  return normalizeCourse(snap as any);
}

/* ---------- UPDATE: only if this AB is in abIds ---------- */

export async function updateCourseForAuthority(
  abUid: string,
  courseId: string,
  updates: CourseUpdateInput
): Promise<Course> {
  const abCode = await getAuthorityCode(abUid);
  if (!abCode) {
    throw new Error("Authority Body code (abId) not found");
  }

  const courseRef = doc(db, "courses", courseId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(courseRef);
    if (!snap.exists()) {
      throw new Error("Course not found");
    }

    const data: any = snap.data();
    const abIds: string[] = Array.isArray(data.abIds) ? data.abIds : [];

    if (!abIds.includes(abCode)) {
      throw new Error("Not authorised to update this course");
    }

    const payload: any = {
      updatedAt: serverTimestamp(),
    };

    if (updates.courseName !== undefined) {
      payload.courseName = updates.courseName;
    }
    if (updates.nsqfLevel !== undefined) {
      payload.nsqfLevel = updates.nsqfLevel;
    }
    if (updates.description !== undefined) {
      payload.description = updates.description;
    }
    if (updates.tags !== undefined) {
      payload.tags = updates.tags;
    }
    if (updates.duration !== undefined) {
      payload.duration = updates.duration;
    }
    if (updates.level !== undefined) {
      payload.level = updates.level;
    }
    if (updates.abIds !== undefined) {
      payload.abIds = updates.abIds;
    }
    if (updates.aaIds !== undefined) {
      payload.aaIds = updates.aaIds;
    }

    tx.update(courseRef, payload);
  });

  const newSnap = await getDoc(courseRef);
  if (!newSnap.exists()) {
    throw new Error("Course not found after update");
  }
  return normalizeCourse(newSnap as any);
}

/* ---------- DELETE: only if this AB is in abIds ---------- */

export async function deleteCourseForAuthority(
  abUid: string,
  courseId: string
): Promise<void> {
  const abCode = await getAuthorityCode(abUid);
  if (!abCode) {
    throw new Error("Authority Body code (abId) not found");
  }

  const courseRef = doc(db, "courses", courseId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(courseRef);
    if (!snap.exists()) {
      throw new Error("Course not found");
    }

    const data: any = snap.data();
    const abIds: string[] = Array.isArray(data.abIds) ? data.abIds : [];

    if (!abIds.includes(abCode)) {
      throw new Error("Not authorised to delete this course");
    }

    tx.delete(courseRef);
  });
}

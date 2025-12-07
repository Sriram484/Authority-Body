// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdTokenResult,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthorityProfile {
  name?: string;
  phone?: string;
  department?: string;
  email?: string;
  role?: string;
  joinedDate?: string;
  abId?: string; // your "3" code if you want
  tempPassword?: boolean;
  tempPasswordValue?: string;
  AssessmentAgencyIds?: string[];
}

interface AuthContextValue {
  user: User | null; // Firebase Auth user
  role: string | null; // from custom claims
  abId: string | null; // we'll use uid here; profile.abId holds "3"
  loading: boolean;
  profile: AuthorityProfile | null; // Firestore doc fields
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    department?: string;
  }) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  abId: null,
  loading: true,
  profile: null,
  login: async () => false,
  logout: async () => {},
  updateProfile: async () => {},
  changePassword: async () => false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [abId, setAbId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthorityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth changes and load claims + profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setAbId(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(firebaseUser);
        const claims = tokenResult.claims as any;

        setUser(firebaseUser);
        setRole((claims && claims.role) || null);
        // use uid as authority-id for now
        setAbId(firebaseUser.uid);

        // Load profile from Firestore
        const ref = doc(db, "Authority_Bodies", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as AuthorityProfile;
          setProfile(data);
        } else {
          // Doc doesn't exist yet – initialise minimal profile
          setProfile({
            email: firebaseUser.email || undefined,
            role: (claims && claims.role) || undefined,
          });
        }
      } catch (err) {
        console.error("Error reading token claims/profile", err);
        setUser(firebaseUser);
        setRole(null);
        setAbId(firebaseUser.uid);
        setProfile({
          email: firebaseUser.email || undefined,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await getIdTokenResult(cred.user);
      const claims = tokenResult.claims as any;

      // Only allow authority body role
      if (!claims.role || claims.role !== "authority_body") {
        console.warn("User does not have authority_body role:", claims.role);
        await signOut(auth);
        return false;
      }

      setUser(cred.user);
      setRole(claims.role);
      setAbId(cred.user.uid);

      // profile will be loaded by onAuthStateChanged listener
      return true;
    } catch (err) {
      console.error("login error", err);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setAbId(null);
    setProfile(null);
  };

  // Use formData to update Firestore; add missing fields if they don't exist
  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    department?: string;
  }) => {
    if (!user) return;

    const ref = doc(db, "Authority_Bodies", user.uid);
    console.log(user.uid);

    await setDoc(
      ref,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true } // create doc or add missing fields
    );

    // update local profile so UI reflects it immediately
    setProfile((prev) => ({
      ...(prev || {}),
      ...data,
    }));
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!user || !user.email) return false;

    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // 2. Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // 3. Clear temp password flags in profile doc (if they exist)
      const ref = doc(db, "Authority_Bodies", user.uid);
      await setDoc(
        ref,
        {
          tempPassword: false,
          tempPasswordValue: "",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setProfile((prev) =>
        prev ? { ...prev, tempPassword: false, tempPasswordValue: "" } : prev
      );

      return true;
    } catch (err) {
      console.error("changePassword error", err);
      return false;
    }
  };

  const value: AuthContextValue = {
    user,
    role,
    abId,
    loading,
    profile,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

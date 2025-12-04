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
} from "firebase/auth";
import { auth } from "../firebase/firebase-config"; 

interface AuthContextValue {
  user: User | null;
  role: string | null;
  abId: string | null;          
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  abId: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [abId, setAbId] = useState<string | null>(null);   

  const [loading, setLoading] = useState(true);

  // Listen to auth state change and load claims
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setAbId(null);   
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(firebaseUser);
        const claims = tokenResult.claims as any;
        setUser(firebaseUser);
        setRole((claims && claims.role) || null);
        setAbId(firebaseUser.uid);
      } catch (err) {
        console.error("Error reading token claims", err);
        setUser(firebaseUser);
        setRole(null);
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
  };

  const value: AuthContextValue = {
    user,
    role,
    abId,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

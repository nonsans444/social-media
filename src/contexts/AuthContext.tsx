import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebase } from "../lib/firebase";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isSetup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    
    try {
      const { auth, db } = getFirebase();
      setIsSetup(true);
      
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              setUser(userDoc.data() as User);
            } else {
              const newUser: User = {
                uid: firebaseUser.uid,
                username: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                city: "Algiers",
                photoURL: firebaseUser.photoURL || "",
                createdAt: Date.now(),
              };
              await setDoc(doc(db, "users", firebaseUser.uid), newUser);
              setUser(newUser);
            }
          } catch (err) {
            console.error("Error syncing user:", err);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } catch (e) {
      console.warn("Firebase not yet set up");
      setLoading(false);
      setIsSetup(false);
    }

    return () => unsubscribe?.();
  }, []);

  const login = async () => {
    const { auth } = getFirebase();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => {
    const { auth } = getFirebase();
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSetup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

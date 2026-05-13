import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
} from "firebase/auth";
import { doc, getDoc, setDoc, getDocFromServer } from "firebase/firestore";
import { getFirebase, handleFirestoreError, OperationType } from "../lib/firebase";
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
          const userPath = `users/${firebaseUser.uid}`;
          try {
            // Use getDoc instead of getDocFromServer for better resilience
            const userDoc = await getDoc(doc(db, userPath));
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
              await setDoc(doc(db, userPath), newUser);
              setUser(newUser);
            }
          } catch (err: any) {
            console.error("Error syncing user:", err);
            handleFirestoreError(err, OperationType.GET, userPath);
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
    try {
      const { auth } = getFirebase();
      const provider = new GoogleAuthProvider();
      // Ensure we use the popup method as it works better in the AI Studio environment
      // when appropriately configured.
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === "auth/popup-blocked") {
        alert("Pop-up blocked. Please allow pop-ups for this site to sign in.");
      } else {
        alert("Login failed: " + error.message);
      }
    }
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

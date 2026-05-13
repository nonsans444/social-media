import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

function getFirebase() {
  if (!app) {
    try {
      // @ts-ignore
      const firebaseConfig = import.meta.glob("../../firebase-applet-config.json", { eager: true, import: "default" })["../../firebase-applet-config.json"];
      
      if (!firebaseConfig) {
        throw new Error("Firebase configuration not found. Please set up Firebase in the UI.");
      }
      
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      // Connectivity check
      getDocFromServer(doc(db, "test", "connection")).catch(() => {});
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      throw e;
    }
  }
  return { auth, db, storage };
}

export { getFirebase };

// Legacy exports for existing code (might error if called before setup)
export const auth_proxy = new Proxy({} as Auth, {
  get: (_, prop) => (getFirebase().auth as any)[prop]
});

export const db_proxy = new Proxy({} as Firestore, {
  get: (_, prop) => (getFirebase().db as any)[prop]
});

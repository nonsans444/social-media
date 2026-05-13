import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authStatus: {
    isSignedIn: boolean;
    isEmailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const { auth } = getFirebase();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authStatus: {
      isSignedIn: !!auth.currentUser,
      isEmailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  }
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error details:', errorJson);
  throw new Error(`Firestore request failed: ${errInfo.error}`);
}

function getFirebase() {
  if (!app) {
    try {
      console.log("Initializing Firebase...");
      // @ts-ignore
      const configs = import.meta.glob("../../firebase-applet-config.json", { eager: true });
      const configModule = configs["../../firebase-applet-config.json"] as any;
      const firebaseConfig = configModule?.default || configModule;
      
      if (!firebaseConfig || !firebaseConfig.apiKey) {
        console.error("Firebase config missing in getFirebase");
        throw new Error("Firebase configuration not found or invalid. Please set up Firebase in the UI.");
      }
      
      console.log("Firebase config found, initializing app:", firebaseConfig.projectId);
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      storage = getStorage(app);
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

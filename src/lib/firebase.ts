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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const { auth } = getFirebase();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);
  throw new Error(errorJson);
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
      db = getFirestore(app);
      storage = getStorage(app);
      
      // Connectivity check
      getDocFromServer(doc(db, "test", "connection"))
        .then(() => console.log("Firestore connection test successful"))
        .catch((err) => {
          if (err.message?.includes("offline")) {
            console.error("Firestore SDK reports being offline. This might be due to network restrictions or initial connection delay.");
          } else {
            console.warn("Firestore connection check failed (expected if rules not set):", err);
          }
        });
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

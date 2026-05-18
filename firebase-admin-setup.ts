import { readFileSync } from "fs";
import {
  initializeApp,
  cert,
  getApp,
  getApps,
  type App,
  type AppOptions,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

export function setupFirebaseAdmin(): { app: App; db: Firestore } {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const databaseId =
    process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;

  const options: AppOptions = { projectId };

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountJson) {
    options.credential = cert(JSON.parse(serviceAccountJson));
  } else if (credentialsPath) {
    options.credential = cert(
      JSON.parse(readFileSync(credentialsPath, "utf8"))
    );
  }

  const app = getApps().length === 0 ? initializeApp(options) : getApp();
  const db = getFirestore(app, databaseId);

  return { app, db };
}

import { readFileSync } from "fs";
import {
  initializeApp,
  cert,
  getApp,
  getApps,
  type App,
  type AppOptions,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

/** Env JSON often stores private_key with literal \\n instead of real newlines. */
function normalizeServiceAccount<T extends { private_key?: string }>(sa: T): T {
  if (typeof sa.private_key === "string" && sa.private_key.includes("\\n")) {
    return { ...sa, private_key: sa.private_key.replace(/\\n/g, "\n") };
  }
  return sa;
}

function parseServiceAccountJson(raw: string): ServiceAccount {
  return normalizeServiceAccount(
    JSON.parse(raw) as { private_key?: string }
  ) as ServiceAccount;
}

function loadServiceAccountFromEnv(): ServiceAccount | null {
  const jsonEnv =
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ??
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (jsonEnv?.trim()) {
    return parseServiceAccountJson(jsonEnv.trim());
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (credentialsPath) {
    return parseServiceAccountJson(readFileSync(credentialsPath, "utf8"));
  }

  return null;
}

export function setupFirebaseAdmin(): { app: App; db: Firestore } {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const databaseId =
    process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;

  const options: AppOptions = { projectId };

  const serviceAccount = loadServiceAccountFromEnv();
  if (serviceAccount) {
    options.credential = cert(serviceAccount);
  }

  const app = getApps().length === 0 ? initializeApp(options) : getApp();
  const db = getFirestore(app, databaseId);

  return { app, db };
}

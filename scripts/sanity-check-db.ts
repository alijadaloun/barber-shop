import dotenv from "dotenv";
import { setupFirebaseAdmin } from "../firebase-admin-setup";
import firebaseConfig from "../firebase-applet-config.json";

dotenv.config();

async function main() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const databaseId =
    process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;

  console.log("=== Firestore sanity check ===");
  console.log(`Project:  ${projectId}`);
  console.log(`Database: ${databaseId}`);
  console.log(`Creds:    ${process.env.GOOGLE_APPLICATION_CREDENTIALS || "(none)"}`);
  console.log("");

  const { db } = setupFirebaseAdmin();

  for (const collection of ["services", "barbers", "appointments", "admins"]) {
    try {
      const snap = await db.collection(collection).limit(500).get();
      const count = snap.size;
      const docs = snap.docs;
      console.log(`[${collection}] count: ${count}`);
      if (count > 0) {
        const sample = docs.slice(0, 3).map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        console.log("  sample:", JSON.stringify(sample, null, 2));
      }
      console.log("");
    } catch (err) {
      console.error(`[${collection}] ERROR:`, err);
      console.log("");
    }
  }

  console.log("=== API routes (server.ts) ===");
  console.log("POST /api/admin/login");
  console.log("POST /api/admin/appointments/:id/accept");
  console.log("POST /api/admin/appointments/:id/reject");
  console.log("(no GET endpoints for services/appointments — client uses Firestore directly)");
}

main().catch((err) => {
  console.error("Sanity check failed:", err);
  process.exit(1);
});

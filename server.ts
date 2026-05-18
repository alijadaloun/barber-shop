import express from "express";
import path from "path";
import { setupFirebaseAdmin } from "./firebase-admin-setup";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { addMinutes, format, parse } from "date-fns";
import { buildAcceptanceEmailHtml, sendEmail } from "./server/email";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

const { db } = setupFirebaseAdmin();

const JWT_SECRET = process.env.JWT_SECRET || "mohtade_secret_2024";

// Auth Middleware
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = (decoded as any).id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

function mapDocs(
  docs: { id: string; data: () => Record<string, unknown> }[]
) {
  return docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Public catalog (browser uses these — no Firebase web API key required)
app.get("/api/services", async (_req, res) => {
  try {
    const snap = await db.collection("services").get();
    res.json(mapDocs(snap.docs));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/barbers", async (_req, res) => {
  try {
    const snap = await db.collection("barbers").get();
    res.json(mapDocs(snap.docs));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/appointments", async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    barberId,
    serviceId,
    appointmentDate,
    startTime,
  } = req.body;

  if (
    !customerName ||
    !customerEmail ||
    !barberId ||
    !serviceId ||
    !appointmentDate ||
    !startTime
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const email = String(customerEmail).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const phone =
    customerPhone != null ? String(customerPhone).trim() : "";

  try {
    const now = new Date().toISOString();
    const appointment: Record<string, unknown> = {
      customerName,
      customerEmail: email,
      barberId,
      serviceId,
      appointmentDate,
      startTime,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    if (phone) appointment.customerPhone = phone;

    const ref = await db.collection("appointments").add(appointment);
    res.status(201).json({ id: ref.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/appointments", authenticateAdmin, async (_req, res) => {
  try {
    const snap = await db
      .collection("appointments")
      .orderBy("createdAt", "desc")
      .get();
    res.json(mapDocs(snap.docs));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admin/services", authenticateAdmin, async (req, res) => {
  const { name, description, price } = req.body;
  const trimmedName = name != null ? String(name).trim() : "";
  const trimmedDescription =
    description != null ? String(description).trim() : "";

  if (!trimmedName || !trimmedDescription || price == null) {
    return res
      .status(400)
      .json({ error: "Name, description, and price are required" });
  }

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return res.status(400).json({ error: "Invalid price" });
  }

  try {
    const now = new Date().toISOString();
    const ref = await db.collection("services").add({
      name: trimmedName,
      description: trimmedDescription,
      price: priceNum,
      createdAt: now,
    });
    res.status(201).json({
      id: ref.id,
      name: trimmedName,
      description: trimmedDescription,
      price: priceNum,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/admin/services/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const ref = db.collection("services").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Service not found" });
    }
    await ref.delete();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// API: Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const adminsRef = db.collection("admins");
    const snapshot = await adminsRef.where("email", "==", email).get();

    if (snapshot.empty) {
      // If no admin exists at all, bootstrap the first one if env matches
      if (email === process.env.ADMIN_EMAIL) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "mohtade123", 10);
        const newAdmin = await adminsRef.add({
          email,
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString()
        });
        const token = jwt.sign({ id: newAdmin.id }, JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();
    
    const isValid = await bcrypt.compare(password, adminData.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: adminDoc.id }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// API: Accept Appointment
app.post("/api/admin/appointments/:id/accept", authenticateAdmin, async (req: any, res) => {
  const { id } = req.params;
  const { durationMinutes } = req.body; // e.g., 30, 60, etc.

  try {
    const appRef = db.collection("appointments").doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) return res.status(404).json({ error: "Appointment not found" });

    const appData = appDoc.data()!;
    if (appData.status !== "pending") return res.status(400).json({ error: "Appointment is not pending" });

    // Calculate end time
    const startDateTime = parse(`${appData.appointmentDate} ${appData.startTime}`, "yyyy-MM-dd HH:mm", new Date());
    const endDateTime = addMinutes(startDateTime, durationMinutes);
    const endTimeStr = format(endDateTime, "HH:mm");

    // Check overlaps for the same barber
    // A confirmed appointment exists if start_time < new_end_time AND end_time > new_start_time
    const overlaps = await db.collection("appointments")
      .where("barberId", "==", appData.barberId)
      .where("appointmentDate", "==", appData.appointmentDate)
      .where("status", "==", "confirmed")
      .get();

    const isOverlapping = overlaps.docs.some(doc => {
      const data = doc.data();
      const existingStart = data.startTime;
      const existingEnd = data.endTime;
      return (appData.startTime < existingEnd && endTimeStr > existingStart);
    });

    if (isOverlapping) {
      return res.status(400).json({ error: "This time slot overlaps with an existing confirmed appointment." });
    }

    await appRef.update({
      status: "confirmed",
      durationMinutes,
      endTime: endTimeStr,
      updatedAt: new Date().toISOString()
    });

    let emailSent = false;
    let emailError: string | undefined;

    const customerEmail = appData.customerEmail;
    if (customerEmail && String(customerEmail).includes("@")) {
      const [barberDoc, serviceDoc] = await Promise.all([
        db.collection("barbers").doc(appData.barberId).get(),
        db.collection("services").doc(appData.serviceId).get(),
      ]);
      const result = await sendEmail({
        to: String(customerEmail).trim().toLowerCase(),
        subject: "Your appointment at Mohtade's Shop is confirmed",
        html: buildAcceptanceEmailHtml({
          customerName: appData.customerName,
          barberName: barberDoc.data()?.name || "Your barber",
          serviceName: serviceDoc.data()?.name || "Your service",
          appointmentDate: appData.appointmentDate,
          startTime: appData.startTime,
          endTime: endTimeStr,
          durationMinutes,
        }),
      });
      if (result.ok) {
        emailSent = true;
        console.log("Confirmation email sent:", result.id, "→", customerEmail);
      } else {
        emailError = result.error;
        console.error("Resend email failed:", result.error);
      }
    } else {
      emailError = "No customer email on this booking";
    }

    res.json({ status: "confirmed", endTime: endTimeStr, emailSent, emailError });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// API: Reject Appointment
app.post("/api/admin/appointments/:id/reject", authenticateAdmin, async (req: any, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  try {
    const appRef = db.collection("appointments").doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) return res.status(404).json({ error: "Appointment not found" });

    const appData = appDoc.data()!;
    
    await appRef.update({
      status: "rejected",
      rejectionReason,
      updatedAt: new Date().toISOString()
    });

    res.json({ status: "rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Seed initial data if empty
async function seedData() {
  const barbersSnapshot = await db.collection("barbers").limit(1).get();
  if (barbersSnapshot.empty) {
    const barbers = [
      { name: "Mohtade", bio: "Master barber with 5 years experience. Specialized in classic cuts.", imageUrl: "https://images.unsplash.com/photo-1503910368127-b442ff5ed335?q=80&w=800", createdAt: new Date().toISOString() },
    ];
    for (const b of barbers) await db.collection("barbers").add(b);
  }

  const servicesSnapshot = await db.collection("services").limit(1).get();
  if (servicesSnapshot.empty) {
    const services = [
      { name: "Classic Haircut", description: "Precision cut, wash and style.", price: 35, createdAt: new Date().toISOString() },
      { name: "Beard Trim", description: "Shape, trim and hot towel finish.", price: 20, createdAt: new Date().toISOString() },
      { name: "The Royal Treatment", description: "Full cut, beard grooming and facial.", price: 65, createdAt: new Date().toISOString() }
    ];
    for (const s of services) await db.collection("services").add(s);
  }
}
seedData().catch((err) => {
  console.error(
    "Firestore seed failed. Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase service account JSON file:",
    err
  );
});

// Vite integration
async function startServer() {
  const isProductionBuild = process.argv[1]
    ?.replace(/\\/g, "/")
    .includes("/dist/");
  if (!isProductionBuild && process.env.NODE_ENV !== "production") {
    // Dynamic import keeps Vite/ESM-only plugins out of the production CJS bundle.
    const { createServer: createViteServer } = await import("vite");
    const { getViteConfig } = await import("./vite.shared.ts");
    const viteBase = getViteConfig();
    const vite = await createViteServer({
      ...viteBase,
      configFile: false,
      appType: "spa",
      server: { ...viteBase.server, middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import dotenv from "dotenv";
import { sendEmail } from "../server/email";

dotenv.config();

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const testTo = process.env.RESEND_TEST_TO || process.env.ADMIN_EMAIL;

  console.log("=== Resend API check ===");
  console.log("API key set:", apiKey ? `yes (${apiKey.slice(0, 8)}…)` : "NO");
  console.log("From:", from || "(default onboarding@resend.dev)");
  console.log("Test recipient:", testTo || "(set RESEND_TEST_TO or ADMIN_EMAIL)");

  if (!apiKey) {
    console.error("\nFAIL: RESEND_API_KEY is missing in .env");
    process.exit(1);
  }

  if (!testTo) {
    console.error("\nFAIL: Set RESEND_TEST_TO or ADMIN_EMAIL in .env for test send");
    process.exit(1);
  }

  const result = await sendEmail({
    to: testTo,
    subject: "Mohtade's Shop — Resend test",
    html: "<p>If you received this, Resend is configured correctly.</p>",
  });

  if (result.ok) {
    console.log("\nOK: Email queued. Resend id:", result.id);
    console.log("Check inbox/spam for:", testTo);
  } else {
    console.error("\nFAIL:", result.error);
    if (result.status === 403) {
      console.error(
        "\n→ Test sender only allows your Resend account email. Use that address as the customer, or verify a domain."
      );
    }
    process.exit(1);
  }
}

main();

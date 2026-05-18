/** @see https://resend.com/docs/api-reference/emails/send-email */

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status?: number };

function normalizeFrom(raw: string | undefined): string {
  const value = raw?.trim() || "Mohtade's Shop <onboarding@resend.dev>";
  if (value.includes("<")) return value;
  return `Mohtade's Shop <${value}>`;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set in .env" };
  }

  const from = normalizeFrom(process.env.RESEND_FROM_EMAIL);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to.trim().toLowerCase()],
      subject: params.subject,
      html: params.html,
    }),
  });

  const body = await res.text();
  let parsed: { id?: string; message?: string } = {};
  try {
    parsed = JSON.parse(body);
  } catch {
    /* plain text error */
  }

  if (!res.ok) {
    const message =
      parsed.message || body || `HTTP ${res.status}`;
    return { ok: false, error: message, status: res.status };
  }

  return { ok: true, id: parsed.id || "unknown" };
}

export function buildAcceptanceEmailHtml(opts: {
  customerName: string;
  barberName: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}): string {
  const {
    customerName,
    barberName,
    serviceName,
    appointmentDate,
    startTime,
    endTime,
    durationMinutes,
  } = opts;

  return `
    <div style="font-family: Georgia, serif; color: #1a1a1a; max-width: 560px; margin: 0 auto;">
      <p style="color: #b8860b; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 8px;">Mohtade's Shop</p>
      <h1 style="font-size: 24px; font-weight: normal; margin: 0 0 24px;">Your appointment is confirmed</h1>
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>Your booking has been <strong>accepted</strong> by our team. Here are your session details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #666;">Service</td><td style="padding: 8px 0;"><strong>${escapeHtml(serviceName)}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Barber</td><td style="padding: 8px 0;"><strong>${escapeHtml(barberName)}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0;"><strong>${escapeHtml(appointmentDate)}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Time</td><td style="padding: 8px 0;"><strong>${escapeHtml(startTime)} – ${escapeHtml(endTime)}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Duration</td><td style="padding: 8px 0;"><strong>${durationMinutes} minutes</strong></td></tr>
      </table>
      <p style="color: #666; font-size: 13px;">We look forward to seeing you. If you need to reschedule, please contact the shop.</p>
    </div>
  `.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

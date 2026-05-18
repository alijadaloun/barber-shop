const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

/** Resolves `/api/...` against VITE_API_URL in production, or same-origin when unset. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Barber {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  barberId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
  rejectionReason?: string;
  createdAt?: string;
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Request failed"
    );
  }
  return data as T;
}

export async function fetchServices(): Promise<Service[]> {
  return parseJson(await fetch(apiUrl("/api/services")));
}

export async function fetchBarbers(): Promise<Barber[]> {
  return parseJson(await fetch(apiUrl("/api/barbers")));
}

export async function createAppointment(body: {
  serviceId: string;
  barberId: string;
  appointmentDate: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}): Promise<{ id: string }> {
  return parseJson(
    await fetch(apiUrl("/api/appointments"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

export async function fetchAppointments(token: string): Promise<Appointment[]> {
  return parseJson(
    await fetch(apiUrl("/api/admin/appointments"), {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> {
  const res = await fetch(apiUrl("/api/admin/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export type AcceptAppointmentResult = {
  error?: string;
  emailSent?: boolean;
  emailError?: string;
};

export async function acceptAppointment(
  token: string,
  id: string,
  durationMinutes: number
): Promise<AcceptAppointmentResult> {
  const res = await fetch(apiUrl(`/api/admin/appointments/${id}/accept`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ durationMinutes }),
  });
  return res.json();
}

export async function rejectAppointment(
  token: string,
  id: string,
  rejectionReason: string
): Promise<{ error?: string }> {
  const res = await fetch(apiUrl(`/api/admin/appointments/${id}/reject`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rejectionReason }),
  });
  return res.json();
}

export async function createService(
  token: string,
  body: { name: string; description: string; price: number }
): Promise<Service> {
  return parseJson(
    await fetch(apiUrl("/api/admin/services"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  );
}

export async function deleteService(
  token: string,
  id: string
): Promise<{ ok: boolean }> {
  return parseJson(
    await fetch(apiUrl(`/api/admin/services/${id}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

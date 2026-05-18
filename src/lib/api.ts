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
  return parseJson(await fetch("/api/services"));
}

export async function fetchBarbers(): Promise<Barber[]> {
  return parseJson(await fetch("/api/barbers"));
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
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

export async function fetchAppointments(token: string): Promise<Appointment[]> {
  return parseJson(
    await fetch("/api/admin/appointments", {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

export async function createService(
  token: string,
  body: { name: string; description: string; price: number }
): Promise<Service> {
  return parseJson(
    await fetch("/api/admin/services", {
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
    await fetch(`/api/admin/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

/** Shop hours: 09:00–20:30 in 30-minute steps */
export function buildTimeSlots(): string[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${min}`;
  }).filter((t) => t <= "20:30");
}

export const TIME_SLOTS = buildTimeSlots();

export function compareTime(a: string, b: string): number {
  return a.localeCompare(b);
}

export function appointmentOccupiesSlot(
  appointment: {
    appointmentDate: string;
    startTime: string;
    endTime?: string;
    status: string;
  },
  date: string,
  slot: string
): boolean {
  if (appointment.appointmentDate !== date) return false;
  if (appointment.status === "rejected" || appointment.status === "cancelled") {
    return false;
  }
  if (appointment.startTime === slot) return true;
  if (appointment.endTime && appointment.startTime < slot && slot < appointment.endTime) {
    return appointment.status === "confirmed" || appointment.status === "completed";
  }
  return false;
}

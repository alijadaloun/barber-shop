import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "../lib/utils";
import {
  TIME_SLOTS,
  appointmentOccupiesSlot,
} from "../lib/schedule";
import type { Appointment, Barber, Service } from "../lib/api";
import { DatePickerPopup } from "./DatePickerPopup";

interface AdminScheduleCalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  appointments: Appointment[];
  barbers: Record<string, Barber>;
  services: Record<string, Service>;
}

const statusStyles: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  confirmed: "border-green-500/40 bg-green-500/10 text-green-200",
  completed: "border-white/20 bg-white/5 text-white/60",
};

export function AdminScheduleCalendar({
  selectedDate,
  onDateChange,
  appointments,
  barbers,
  services,
}: AdminScheduleCalendarProps) {
  const dayAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.appointmentDate === selectedDate &&
          a.status !== "rejected" &&
          a.status !== "cancelled"
      ),
    [appointments, selectedDate]
  );

  const dateLabel = format(parseISO(selectedDate), "EEEE, MMMM d, yyyy");

  const renderSlotContent = (slot: string) => {
    const slotApps = dayAppointments.filter((app) =>
      appointmentOccupiesSlot(app, selectedDate, slot)
    );
    const isStartSlot = (app: Appointment) => app.startTime === slot;

    if (slotApps.length === 0) {
      return (
        <span className="text-white/15 text-[10px] uppercase tracking-widest italic">
          Available
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {slotApps.map((app) => (
          <div
            key={`${app.id}-${slot}`}
            className={cn(
              "border px-3 sm:px-4 py-2 sm:py-3 rounded-sm",
              statusStyles[app.status] ||
                "border-white/10 bg-white/5 text-white/50"
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                {app.customerName}
              </span>
              <span className="text-[10px] uppercase tracking-widest opacity-70">
                {barbers[app.barberId]?.name ?? "Barber"}
              </span>
              <span className="text-[10px] italic opacity-60">
                {services[app.serviceId]?.name ?? "Service"}
              </span>
            </div>
            <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">
              {app.status}
              {isStartSlot(app) && app.endTime
                ? ` · ${app.startTime} – ${app.endTime}`
                : !isStartSlot(app)
                  ? " · continues"
                  : ` · ${app.startTime}`}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#151515] luxury-border rounded-sm overflow-hidden shadow-2xl mb-8 sm:mb-12">
      <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 border-b border-white/10 bg-white/[0.02]">
        <span className="text-gold-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">
          Day schedule
        </span>
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 sm:gap-6 justify-between">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-serif text-white italic break-words">
              {dateLabel}
            </h2>
            <p className="text-white/30 text-[10px] uppercase tracking-widest mt-2">
              {dayAppointments.length} booking
              {dayAppointments.length === 1 ? "" : "s"} this day
            </p>
          </div>
          <div className="w-full lg:max-w-xs shrink-0">
            <DatePickerPopup
              value={selectedDate}
              onChange={onDateChange}
              label="View date"
            />
          </div>
        </div>
      </div>

      <div className="md:hidden divide-y divide-white/5">
        {TIME_SLOTS.map((slot) => (
          <div key={slot} className="px-4 py-4">
            <span className="text-gold-500/90 text-sm font-mono tracking-wide block mb-2">
              {slot}
            </span>
            {renderSlotContent(slot)}
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 lg:px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold w-24">
                Time
              </th>
              <th className="px-4 lg:px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Bookings
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {TIME_SLOTS.map((slot) => (
              <tr key={slot} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 lg:px-6 py-3 align-top">
                  <span className="text-gold-500/90 text-sm font-mono tracking-wide">
                    {slot}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-3">{renderSlotContent(slot)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

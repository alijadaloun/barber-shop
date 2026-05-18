import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { cn } from "../lib/utils";

interface DatePickerPopupProps {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  label?: string;
}

export function DatePickerPopup({
  value,
  onChange,
  label = "Calendar Date",
}: DatePickerPopupProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(value ? parseISO(value) : new Date())
  );

  const today = startOfDay(new Date());
  const selected = value ? parseISO(value) : today;

  useEffect(() => {
    if (value) setViewMonth(startOfMonth(parseISO(value)));
  }, [value]);

  const monthStart = startOfMonth(viewMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }),
  });

  const pick = (day: Date) => {
    if (isBefore(day, today)) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold ml-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-[#0c0c0c] border border-white/5 p-4 text-xs outline-none focus:border-gold-500 transition-colors text-white rounded-none flex items-center justify-between gap-3 hover:border-gold-500/40"
      >
        <span className="tracking-wide sm:tracking-widest text-left text-[11px] sm:text-xs truncate">
          {value
            ? format(selected, "EEE, MMM d, yyyy")
            : "Select a date"}
        </span>
        <Calendar className="w-4 h-4 text-gold-500 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative bg-[#151515] border border-white/10 p-6 md:p-8 rounded-sm w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                  className="p-2 border border-white/10 text-white/50 hover:text-white hover:border-gold-500/50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm uppercase tracking-[0.25em] text-gold-500 font-bold">
                  {format(viewMonth, "MMMM yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  className="p-2 border border-white/10 text-white/50 hover:text-white hover:border-gold-500/50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[9px] uppercase tracking-widest text-white/30 py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const disabled = isBefore(day, today);
                  const isSelected = value && isSameDay(day, selected);
                  const inMonth = isSameMonth(day, viewMonth);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => pick(day)}
                      className={cn(
                        "aspect-square text-xs font-medium transition-all rounded-sm",
                        !inMonth && "text-white/15",
                        inMonth && !disabled && "text-white/70 hover:bg-gold-500/20 hover:text-white",
                        disabled && "text-white/10 cursor-not-allowed",
                        isSelected &&
                          "bg-gold-500 text-black hover:bg-gold-500 hover:text-black",
                        !disabled &&
                          isSameDay(day, today) &&
                          !isSelected &&
                          "ring-1 ring-gold-500/50"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>

              <p className="text-[9px] text-white/30 text-center mt-6 uppercase tracking-widest">
                Today and future dates only
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

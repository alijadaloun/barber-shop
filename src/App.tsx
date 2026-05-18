/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scissors, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Menu, 
  X,
  LogOut,
  Bell,
  Trash2,
  Check,
  AlertCircle,
  Plus
} from "lucide-react";
import { cn } from "./lib/utils";
import {
  createAppointment,
  createService,
  deleteService,
  fetchAppointments,
  fetchBarbers,
  fetchServices,
  type Appointment,
  type Barber,
  type Service,
} from "./lib/api";
import { useCatalog } from "./hooks/useCatalog";
import { TIME_SLOTS } from "./lib/schedule";
import { DatePickerPopup } from "./components/DatePickerPopup";
import { AdminScheduleCalendar } from "./components/AdminScheduleCalendar";
import { format } from "date-fns";
import barbershopImg from "../assets/barbershop.jpg";
import mohtadePic from "../assets/mohtadepic.jpeg";

// --- Components ---

const Navbar = ({ onNavigate, currentPath, isAdmin }: { onNavigate: (path: string) => void, currentPath: string, isAdmin: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c0c0c]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 md:h-24 flex items-center justify-between gap-3">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => onNavigate("/")}
        >
          <div className="w-10 h-10 border-2 border-gold-500 flex items-center justify-center transform rotate-45 transition-transform group-hover:bg-gold-500/10">
            <span className="-rotate-45 font-serif text-xl font-bold text-gold-500">M</span>
          </div>
          <span className="text-sm sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] font-light uppercase text-white">Mohtade’s Shop</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: "Home", path: "/" },
            { name: "Shop", path: "/book" },
            { name: "Admin", path: "/admin/login", hidden: isAdmin }
          ].filter(i => !i.hidden).map(item => (
            <button 
              key={item.path}
              onClick={() => onNavigate(item.path)} 
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all pb-1",
                currentPath === item.path ? "text-gold-500 border-b border-gold-500" : "text-white/60 hover:text-white"
              )}
            >
              {item.name}
            </button>
          ))}
          {isAdmin && (
            <button 
              onClick={() => onNavigate("/admin")} 
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all pb-1",
                currentPath === "/admin" ? "text-gold-500 border-b border-gold-500" : "text-white/60 hover:text-white"
              )}
            >
              Master Ledger
            </button>
          )}
          {!isAdmin && currentPath !== "/book" && (
            <button 
              onClick={() => onNavigate("/book")} 
              className="bg-gold-500 text-black px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gold-600 transition-colors shadow-2xl shadow-gold-600/10"
            >
              Reserve Chair
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-zinc-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0c0c0c] border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8 items-center w-full">
              <button onClick={() => { onNavigate("/"); setIsOpen(false); }} className="text-sm uppercase tracking-[0.3em] font-light">Home</button>
              {!isAdmin && <button onClick={() => { onNavigate("/book"); setIsOpen(false); }} className="bg-gold-500 text-black px-12 py-4 rounded-sm font-bold text-xs uppercase tracking-[0.3em]">Reserve Chair</button>}
              {isAdmin && (
                <button onClick={() => { onNavigate("/admin"); setIsOpen(false); }} className="text-sm uppercase tracking-[0.3em] font-light text-gold-500 underline underline-offset-8">Master Ledger</button>
              )}
              {!isAdmin && (
                <button onClick={() => { onNavigate("/admin/login"); setIsOpen(false); }} className="text-sm uppercase tracking-[0.3em] font-light text-white/30">Admin Portal</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const HomePage = ({ onBook }: { onBook: () => void }) => {
  const { services, barbers, loading, error } = useCatalog();

  return (
    <div className="pt-16 sm:pt-20 md:pt-24">
      {/* Hero */}
      <section className="relative min-h-0 sm:min-h-[85vh] lg:min-h-[90vh] flex items-center py-10 sm:py-0 px-4 sm:px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105">
          <div className="absolute inset-0 bg-[#0c0c0c]/85 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2000" 
            className="w-full h-full object-cover grayscale opacity-40 translate-y-[-10%]"
            alt="Barber Background"
          />
        </div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="flex-1"
          >
            {error && (
              <p className="text-red-400 text-xs uppercase tracking-widest mb-4">{error}</p>
            )}
            <span className="text-gold-500 uppercase tracking-[0.5em] text-[10px] font-bold mb-6 block">Artisanal Barbering</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl title-serif mb-6 sm:mb-8 leading-tight">
              Mastering the <br />
              <span className="italic text-gold-500">Art of Grooming</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base md:text-lg mb-8 sm:mb-12 max-w-md font-light leading-relaxed">
              Experience luxury grooming where traditional craftsmanship meets modern sophistication. Each cut is a tailored experience designed for the discerning gentleman.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mb-8 sm:mb-12">
              {services.slice(0, 2).map(s => (
                <div key={s.id} className="p-4 sm:p-5 border border-white/10 bg-white/5 backdrop-blur-sm group hover:border-gold-500/30 transition-all">
                  <p className="text-gold-500 text-[10px] uppercase font-bold tracking-widest mb-1">{s.name}</p>
                  <p className="text-lg sm:text-xl font-light text-white">${s.price} <span className="text-white/20 ml-2">• 45m</span></p>
                </div>
              ))}
            </div>

            <div className="flex w-full sm:w-auto">
              <button 
                onClick={onBook}
                className="w-full sm:w-auto bg-gold-500 text-black px-8 sm:px-12 py-4 sm:py-5 rounded-sm font-bold text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-gold-600 transition-all hover:-translate-y-1 shadow-2xl shadow-gold-500/20"
              >
                Reserve Your Chair
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="flex-1 relative w-full mt-6 lg:mt-0"
          >
            <div className="absolute -inset-2 sm:-inset-4 border border-gold-500/20 rounded-sm -z-10 translate-x-2 translate-y-2 sm:translate-x-4 sm:translate-y-4" />
            <div className="relative h-[min(55vw,280px)] sm:h-[400px] lg:h-[650px] w-full overflow-hidden rounded-sm luxury-border">
              <img src={barbershopImg} className="w-full h-full object-cover grayscale brightness-75" alt="Shop Interior" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Logo line */}
      <div className="border-y border-white/5 py-8 sm:py-12 px-4 sm:px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-between gap-6 sm:gap-12 items-center opacity-40">
           <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest mb-1">Established</span><span className="text-xl font-serif">MMX</span></div>
           <div className="h-10 w-px bg-white/10 hidden md:block" />
           <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest mb-1">Standard</span><span className="text-xl font-serif">Excellence</span></div>
           <div className="h-10 w-px bg-white/10 hidden md:block" />
           <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest mb-1">Craft</span><span className="text-xl font-serif">Handmade</span></div>
           <div className="h-10 w-px bg-white/10 hidden md:block" />
           <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest mb-1">Location</span><span className="text-xl font-serif">London</span></div>
        </div>
      </div>

      {/* Services Full */}
      <section className="py-16 sm:py-24 md:py-32 bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-24">
            <span className="text-gold-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Tailored Grooming</span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl title-serif mb-6 italic text-white/90">The Menu of Services</h2>
            <div className="w-20 h-px bg-gold-500/50 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {services.map((service) => (
              <div 
                key={service.id}
                className="p-6 sm:p-10 md:p-12 bg-[#0c0c0c] hover:bg-zinc-900/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-gold-500/10 transition-all" />
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-gold-500 mb-6">{service.name}</h3>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-4xl font-light text-white font-serif">${service.price}</span>
                  <span className="text-white/20 text-xs tracking-widest">/ 45 MINS</span>
                </div>
                <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">{service.description}</p>
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 text-gold-500 text-[10px] uppercase tracking-widest font-bold">Details (Selection)</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section className="py-16 sm:py-24 md:py-32 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-4">
            <span className="text-gold-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-6 block">The Curators</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl title-serif mb-6 sm:mb-8 text-white leading-tight italic">Our Master<br />Barbers</h2>
            <p className="text-white/40 font-light text-lg leading-relaxed mb-12">
              Hand-selected for their impeccable style and surgical precision. More than barbers, they are keepers of the craft.
            </p>
            <button 
              onClick={onBook}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 border border-gold-500/30 text-gold-500 text-[10px] uppercase tracking-widest font-bold hover:bg-gold-500 hover:text-black transition-all"
            >
              Meet Them in Person
            </button>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {barbers.map((barber) => (
              <div key={barber.id} className="group relative h-[min(70vh,420px)] sm:h-[520px] lg:h-[650px] overflow-hidden rounded-sm luxury-border">
                <img
                  src={barber.name === "Mohtade" ? mohtadePic : barber.imageUrl}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                  alt={barber.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                  <span className="text-gold-500 text-[10px] uppercase tracking-[0.5em] font-bold mb-2 block">Master Class</span>
                  <h3 className="text-2xl sm:text-3xl font-serif text-white mb-4">{barber.name}</h3>
                  <p className="text-white/30 font-light text-sm line-clamp-2 italic">{barber.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location/Footer Detail */}
      <section className="py-12 bg-[#0c0c0c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
           <div className="flex flex-col py-6 sm:py-8 md:border-r md:border-white/5 md:mr-12 md:pr-12">
             <span className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-3">The Residence</span>
             <span className="text-sm text-white/50 font-light">122 High Street, Elite District<br />London, WC1V 7EE</span>
           </div>
           <div className="flex flex-col py-6 sm:py-8 md:border-r md:border-white/5 md:mr-12 md:pr-12">
             <span className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-3">The Hotline</span>
             <span className="text-sm text-white/50 font-light">+44 20 7946 0958<br />concierge@mohtade.com</span>
           </div>
           <div className="flex flex-col py-6 sm:py-8 sm:col-span-2 md:col-span-1">
             <span className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-3">Availability</span>
             <span className="text-sm text-white/50 font-light">Mon – Sat: 09:00 – 20:00<br />Sun: By Appointment Only</span>
           </div>
        </div>
      </section>
    </div>
  );
};

const BookingPage = ({ onSuccess }: { onSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: "",
    barberId: "",
    appointmentDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });
  
  const { services, barbers, loading: catalogLoading, error: catalogError } = useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.customerEmail) {
      setError("Please provide your name and email address.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment(formData);
      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to book appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-32 px-4 sm:px-6 min-h-screen flex items-start justify-center bg-[#0c0c0c]">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-gold-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-6 block">Reservation</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-light leading-tight mb-6 sm:mb-10 text-white italic">Reserve Your <br /><span className="text-gold-500 not-italic">Barber Chair</span></h2>
          <p className="text-white/40 font-light leading-relaxed mb-8 lg:mb-16 max-w-sm text-base sm:text-lg">Every booking is a commitment to excellence. Choose your preferences and we'll handle the rest.</p>
          
          <div className="space-y-4 sm:space-y-6 lg:border-l lg:border-white/5 lg:pl-8 mb-6 lg:mb-0">
            <div className="flex items-center gap-4 text-white/20">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Session Detail</span>
            </div>
            {formData.serviceId ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold-500 text-2xl font-serif">{services.find(s => s.id === formData.serviceId)?.name}</motion.div>
            ) : (
              <div className="text-white/10 text-2xl font-serif italic">No Service Selected</div>
            )}
            {formData.barberId && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm font-light tracking-wide italic">With Master {barbers.find(b => b.id === formData.barberId)?.name}</motion.div>
            )}
          </div>
        </div>

        <div className="bg-[#151515] rounded-sm luxury-border p-6 sm:p-10 md:p-14 relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
          
          <div className="flex justify-between items-center gap-4 mb-10 sm:mb-16">
            <div className="flex gap-1.5 sm:gap-2 flex-1 min-w-0">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={cn("h-1 flex-1 max-w-12 transition-all duration-500", step >= i ? "bg-gold-500" : "bg-white/5")} />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/30 font-bold shrink-0">Phase {step}/4</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold block">1. Choose Service</span>
                  {catalogLoading && (
                    <p className="text-white/30 text-xs uppercase tracking-widest">Loading services…</p>
                  )}
                  {catalogError && (
                    <p className="text-red-400 text-xs uppercase tracking-widest">{catalogError}</p>
                  )}
                  {!catalogLoading && !catalogError && services.length === 0 && (
                    <p className="text-white/30 text-xs uppercase tracking-widest">No services available.</p>
                  )}
                  <div className="grid gap-4">
                    {services.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => { setFormData({ ...formData, serviceId: s.id }); setStep(2); }}
                        className={cn(
                          "p-4 sm:p-6 text-left border rounded-sm transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 group",
                          formData.serviceId === s.id ? "border-gold-500 bg-gold-500/5" : "border-white/5 hover:border-gold-500/30 hover:bg-white/5"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-zinc-100 text-sm font-bold tracking-widest uppercase mb-1">{s.name}</p>
                          <p className="text-white/20 text-xs font-light italic">Approx. 45 min session</p>
                        </div>
                        <span className="text-gold-500 font-serif text-xl sm:border-l sm:border-white/5 sm:pl-8 italic shrink-0">${s.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold block">2. Select Master Barber</span>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4">
                    {barbers.map(b => (
                      <button 
                        key={b.id}
                        onClick={() => { setFormData({ ...formData, barberId: b.id }); setStep(3); }}
                        className={cn(
                          "p-4 sm:p-6 border rounded-sm flex flex-col items-center transition-all group",
                          formData.barberId === b.id ? "border-gold-500 bg-gold-500/5" : "border-white/5 hover:border-gold-500/30 hover:bg-white/5"
                        )}
                      >
                        <div className="relative mb-6">
                          <div className={cn("absolute -inset-1 border border-gold-500/30 rounded-full transition-all group-hover:scale-110", formData.barberId === b.id ? "opacity-100" : "opacity-0")} />
                          <img src={b.name === "Mohtade" ? mohtadePic : b.imageUrl} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover grayscale transition-all group-hover:grayscale-0 relative z-10" alt={b.name} />
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-white font-bold">{b.name}</span>
                        <span className="text-[9px] uppercase tracking-widest text-gold-500/50 mt-1">Master Class</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors flex items-center gap-2">← Change Service</button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold block">3. Specify Time</span>
                    <div className="grid gap-6">
                      <DatePickerPopup
                        value={formData.appointmentDate}
                        onChange={(appointmentDate) =>
                          setFormData({ ...formData, appointmentDate })
                        }
                      />
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold ml-1">Arrival Window</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {TIME_SLOTS.map(t => (
                            <button 
                              key={t}
                              onClick={() => setFormData({ ...formData, startTime: t })}
                              className={cn(
                                "p-3 text-[10px] border transition-all font-bold rounded-none",
                                formData.startTime === t ? "border-gold-500 bg-gold-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "border-white/5 text-white/30 hover:border-gold-500/50 hover:text-white"
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6 border-t border-white/5">
                     <button onClick={() => setStep(2)} className="flex-1 py-4 border border-white/5 text-white/30 text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">Back</button>
                     <button disabled={!formData.startTime} onClick={() => setStep(4)} className="flex-[2] bg-gold-500 text-black py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-gold-600 transition-all shadow-xl shadow-gold-500/10">Continue</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold block">4. Identification</span>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold ml-1">Full Name</label>
                        <input 
                          placeholder="Lord Kensington"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          className="w-full bg-[#0c0c0c] border border-white/5 p-5 text-xs outline-none focus:border-gold-500 transition-colors text-white rounded-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold ml-1">Email</label>
                        <input 
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          className="w-full bg-[#0c0c0c] border border-white/5 p-5 text-xs outline-none focus:border-gold-500 transition-colors text-white rounded-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold ml-1">Phone <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span></label>
                        <input 
                          type="tel"
                          placeholder="+44 700 000 0000"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                          className="w-full bg-[#0c0c0c] border border-white/5 p-5 text-xs outline-none focus:border-gold-500 transition-colors text-white rounded-none"
                        />
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-[10px] uppercase tracking-widest text-center animate-pulse">{error}</p>}

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <button 
                      disabled={isSubmitting}
                      onClick={handleSubmit} 
                      className="w-full bg-gold-500 text-black py-6 uppercase tracking-[0.4em] text-[11px] font-bold hover:bg-gold-600 shadow-2xl shadow-gold-500/20 transition-all group overflow-hidden relative"
                    >
                      <span className="relative z-10">{isSubmitting ? "Dispatching..." : "Commit Appointment"}</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                    <p className="text-center text-[9px] text-white/20 italic tracking-wider">Approval required by the shop master.</p>
                  </div>
                  <button onClick={() => setStep(3)} className="w-full text-[10px] uppercase tracking-widest text-white/10 hover:text-white transition-colors">← Back to Timeline</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = ({ onHome }: { onHome: () => void }) => (
  <div className="pt-24 sm:pt-32 flex items-center justify-center min-h-screen px-4 sm:px-6 bg-[#0c0c0c]">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full bg-[#151515] luxury-border p-8 sm:p-12 md:p-16 text-center rounded-sm"
    >
      <div className="w-24 h-24 border-2 border-gold-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-gold-500/10">
        <CheckCircle2 className="w-10 h-10 text-gold-500" />
      </div>
      <h2 className="text-4xl font-serif font-light text-white mb-6 italic">Request <span className="text-gold-500 not-italic">Dispatched</span></h2>
      <p className="text-white/30 mb-12 font-light text-sm leading-relaxed tracking-wide">
        Mohtade and his team are reviewing your appointment. You will receive an email when your booking is confirmed.
      </p>
      <button 
        onClick={onHome}
        className="w-full py-5 bg-gold-500 text-black rounded-sm font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gold-600 transition-all shadow-xl shadow-gold-500/10"
      >
        Return to Shop
      </button>
    </motion.div>
  </div>
);

const AdminLoginPage = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        onLogin(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-32 min-h-screen flex items-center justify-center px-4 sm:px-6 bg-[#0c0c0c]">
      <div className="max-w-md w-full bg-[#151515] luxury-border p-8 sm:p-12 rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        <div className="text-center mb-12">
          <div className="w-12 h-12 border-2 border-gold-500 flex items-center justify-center mx-auto mb-6 transform rotate-45 transition-transform hover:bg-gold-500/10">
            <User className="-rotate-45 text-gold-500 w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-light text-white italic">Admin <span className="text-gold-500 not-italic tracking-widest">Portal</span></h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 ml-1">Access Identity</label>
            <input 
              type="email" 
              required
              placeholder="admin@mohtade.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/5 p-5 text-white text-xs outline-none focus:border-gold-500 transition-colors rounded-none placeholder:text-white/10"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 ml-1">Master Phrase</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/5 p-5 text-white text-xs outline-none focus:border-gold-500 transition-colors rounded-none placeholder:text-white/10"
            />
          </div>
          {error && <p className="text-red-500 text-[10px] uppercase tracking-widest text-center animate-pulse">{error}</p>}
          <button 
            disabled={loading}
            className="w-full py-5 bg-gold-500 text-black rounded-sm font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-gold-600 transition-all shadow-2xl shadow-gold-500/20 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Authorize Portal"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ token, onLogout }: { token: string, onLogout: () => void }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [barbers, setBarbers] = useState<Record<string, Barber>>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [notification, setNotification] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [serviceSaving, setServiceSaving] = useState(false);

  const loadDashboard = async () => {
    try {
      const [apps, svcList, barberList] = await Promise.all([
        fetchAppointments(token),
        fetchServices(),
        fetchBarbers(),
      ]);
      const lastApp = apps[0];
      if (lastApp?.status === "pending" && lastApp.createdAt) {
        const created = new Date(lastApp.createdAt).getTime();
        if (created > Date.now() - 5000) {
          setNotification(`Master, a new request from ${lastApp.customerName} just arrived.`);
          setTimeout(() => setNotification(null), 5000);
        }
      }
      setAppointments(apps);
      setServices(Object.fromEntries(svcList.map((s) => [s.id, s])));
      setBarbers(Object.fromEntries(barberList.map((b) => [b.id, b])));
    } catch (err) {
      console.error("Dashboard load failed:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/accept`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ durationMinutes: duration })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        setShowAcceptModal(null);
        loadDashboard();
        if (data.emailSent) {
          alert("Appointment confirmed. Confirmation email sent to the customer.");
        } else if (data.emailError) {
          alert(
            `Appointment confirmed, but email was not sent:\n\n${data.emailError}\n\n` +
              "With Resend test mode (onboarding@resend.dev), you can only email your Resend account address. " +
              "Verify a domain at resend.com/domains for real customers."
          );
        }
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(newService.price);
    if (!newService.name.trim() || !newService.description.trim()) {
      alert("Name and description are required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      alert("Enter a valid price.");
      return;
    }
    setServiceSaving(true);
    try {
      await createService(token, {
        name: newService.name.trim(),
        description: newService.description.trim(),
        price,
      });
      setNewService({ name: "", description: "", price: "" });
      loadDashboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not add service");
    } finally {
      setServiceSaving(false);
    }
  };

  const handleRemoveService = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the menu?`)) return;
    try {
      await deleteService(token, id);
      loadDashboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not remove service");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/reject`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        setShowRejectModal(null);
        setRejectionReason("");
        loadDashboard();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const durationOptions = [
    { label: "10 min", val: 10 }, { label: "20 min", val: 20 }, { label: "30 min", val: 30 },
    { label: "40 min", val: 40 }, { label: "50 min", val: 50 }, { label: "1 hour", val: 60 },
    { label: "1h 10m", val: 70 }, { label: "1h 20m", val: 80 }, { label: "1h 30m", val: 90 },
    { label: "1h 40m", val: 100 }, { label: "1h 50m", val: 110 }, { label: "2 hours", val: 120 }
  ];

  const serviceList: Service[] = Object.values(services);

  return (
    <div className="pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 min-h-screen bg-[#0c0c0c]">
      <div className="max-w-7xl mx-auto min-w-0">
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 sm:top-28 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[60] bg-gold-500 text-black px-4 sm:px-8 py-3 sm:py-4 rounded-sm flex items-center gap-3 sm:gap-4 shadow-2xl font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] max-w-lg sm:max-w-none mx-auto sm:mx-0"
            >
              <Bell className="w-4 h-4 animate-ring" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-16 gap-6 sm:gap-8">
          <div>
            <span className="text-gold-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Master Operations</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light italic text-white leading-tight">Master <br /><span className="text-gold-500 not-italic">Ledger</span></h1>
          </div>
          <button 
            onClick={onLogout}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 border border-white/5 text-white/30 text-[10px] uppercase tracking-widest font-bold hover:text-white hover:border-white transition-all rounded-sm flex items-center justify-center gap-3"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="bg-[#151515] luxury-border rounded-sm overflow-hidden shadow-2xl mb-8 sm:mb-12">
          <div className="px-4 sm:px-10 py-5 sm:py-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold italic">
              Service menu
            </span>
            <span className="text-[10px] text-white/20 uppercase tracking-widest">
              {serviceList.length} offering{serviceList.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="p-4 sm:p-10 border-b border-white/5">
            <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2 block">Name</label>
                <input
                  value={newService.name}
                  onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Classic Haircut"
                  className="w-full bg-[#0c0c0c] border border-white/5 p-4 text-white text-sm outline-none focus:border-gold-500 rounded-none placeholder:text-white/10"
                />
              </div>
              <div className="md:col-span-5">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2 block">Description</label>
                <input
                  value={newService.description}
                  onChange={(e) => setNewService((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Precision cut, wash and style."
                  className="w-full bg-[#0c0c0c] border border-white/5 p-4 text-white text-sm outline-none focus:border-gold-500 rounded-none placeholder:text-white/10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2 block">Price ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newService.price}
                  onChange={(e) => setNewService((s) => ({ ...s, price: e.target.value }))}
                  placeholder="35"
                  className="w-full bg-[#0c0c0c] border border-white/5 p-4 text-white text-sm outline-none focus:border-gold-500 rounded-none placeholder:text-white/10"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={serviceSaving}
                  className="w-full py-4 bg-gold-500 text-black text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {serviceSaving ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          </div>
          <div className="divide-y divide-white/5">
            {serviceList.length === 0 ? (
              <p className="px-10 py-12 text-center text-white/20 text-sm italic font-serif">
                No services yet. Add one above.
              </p>
            ) : (
              serviceList.map((service: Service) => (
                <div
                  key={service.id}
                  className="px-10 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <div className="text-gold-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-1">
                      {service.name}
                    </div>
                    <p className="text-white/40 text-sm font-light max-w-xl">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-2xl font-serif text-white">${service.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service.id, service.name)}
                      className="w-11 h-11 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      title="Remove service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <AdminScheduleCalendar
          selectedDate={scheduleDate}
          onDateChange={setScheduleDate}
          appointments={appointments}
          barbers={barbers}
          services={services}
        />

        <div className="bg-[#151515] luxury-border rounded-sm overflow-hidden shadow-2xl">
          <div className="px-4 sm:px-10 py-5 sm:py-6 border-b border-white/10 bg-white/5">
            <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold italic">
              All requests
            </span>
          </div>

          <div className="md:hidden divide-y divide-white/5">
            {appointments.length === 0 ? (
              <p className="px-4 py-16 text-center text-white/20 font-serif italic">The ledger is pure.</p>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="p-4 sm:p-6 space-y-3">
                  <p className="text-sm font-bold text-white uppercase">{app.customerName}</p>
                  {app.customerEmail && <p className="text-[11px] text-white/30 break-all">{app.customerEmail}</p>}
                  {app.customerPhone && (
                    <a href={`tel:${app.customerPhone.replace(/\s/g, "")}`} className="text-[11px] text-gold-500 block">{app.customerPhone}</a>
                  )}
                  <p className="text-gold-500 font-serif italic">{services[app.serviceId]?.name}</p>
                  <p className="text-[10px] uppercase text-white/30">With {barbers[app.barberId]?.name}</p>
                  <p className="text-sm text-white">{app.appointmentDate} · {app.startTime}</p>
                  <div className="flex gap-2 pt-2">
                    {app.status === "pending" && (
                      <>
                        <button onClick={() => setShowAcceptModal(app.id)} className="flex-1 py-3 border border-green-500/30 text-green-500 text-[10px] uppercase font-bold">Accept</button>
                        <button onClick={() => setShowRejectModal(app.id)} className="flex-1 py-3 border border-red-500/30 text-red-500 text-[10px] uppercase font-bold">Decline</button>
                      </>
                    )}
                    {app.status === "confirmed" && <span className="text-[10px] uppercase text-green-500 font-bold">Active</span>}
                    {app.status === "rejected" && <span className="text-[10px] uppercase text-red-500/40 line-through">Declined</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 lg:px-10 py-6 lg:py-8 text-[11px] uppercase tracking-widest text-white/40 font-bold italic">Client Identity</th>
                  <th className="px-10 py-8 text-[11px] uppercase tracking-widest text-white/40 font-bold italic">Session Detail</th>
                  <th className="px-10 py-8 text-[11px] uppercase tracking-widest text-white/40 font-bold italic">Timeline</th>
                  <th className="px-10 py-8 text-[11px] uppercase tracking-widest text-white/40 font-bold italic">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-10 py-32 text-center text-white/20 font-serif italic text-2xl tracking-widest leading-relaxed">
                        The ledger is pure.<br /><span className="text-sm uppercase tracking-[0.4em] font-sans not-italic">Awaiting requests of excellence</span>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((app) => (
                      <motion.tr 
                        layout
                        key={app.id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="px-10 py-10">
                          <div className="text-sm font-bold text-white tracking-[0.1em] uppercase mb-1">{app.customerName}</div>
                          {app.customerEmail && (
                            <div className="text-[11px] text-white/20 font-light italic">{app.customerEmail}</div>
                          )}
                          {app.customerPhone && (
                            <a href={`tel:${app.customerPhone.replace(/\s/g, "")}`} className="text-[11px] text-gold-500/80 font-light tracking-wide hover:text-gold-500">
                              {app.customerPhone}
                            </a>
                          )}
                        </td>
                        <td className="px-10 py-10">
                          <div className="text-gold-500 font-serif mb-1 italic text-lg">{services[app.serviceId]?.name}</div>
                          <div className="text-[10px] uppercase text-white/30 tracking-[0.3em] font-bold">With {barbers[app.barberId]?.name}</div>
                        </td>
                        <td className="px-10 py-10">
                          <div className="text-sm text-white font-light tracking-widest mb-1">{app.appointmentDate}</div>
                          <div className="text-gold-500/80 text-[10px] uppercase font-bold tracking-widest italic">{app.startTime} {app.endTime && `(Ends ${app.endTime})`}</div>
                        </td>
                        <td className="px-10 py-10">
                          <div className="flex gap-4">
                            {app.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => setShowAcceptModal(app.id)}
                                  className="w-12 h-12 border border-green-500/30 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-black transition-all"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => setShowRejectModal(app.id)}
                                  className="w-12 h-12 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {app.status === "confirmed" && (
                              <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold">Active</span>
                              </div>
                            )}
                            {app.status === "rejected" && <span className="text-[10px] uppercase tracking-widest text-red-500/40 font-bold italic line-through">Declined</span>}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAcceptModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowAcceptModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#151515] border border-white/10 p-6 sm:p-12 rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <span className="text-gold-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Scheduling Verdict</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-light text-white mb-6 sm:mb-8 italic">Precision <span className="text-gold-500 not-italic">Allocation</span></h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8 sm:mb-10">
                {durationOptions.map(opt => (
                  <button 
                    key={opt.val}
                    onClick={() => setDuration(opt.val)}
                    className={cn(
                      "p-4 border text-[11px] font-bold uppercase tracking-widest transition-all",
                      duration === opt.val ? "bg-gold-500 border-gold-500 text-black shadow-xl" : "border-white/5 text-white/30 hover:border-gold-500/50 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowAcceptModal(null)} className="flex-1 py-5 border border-white/5 text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-white hover:border-white transition-all">Stall</button>
                <button onClick={() => handleAccept(showAcceptModal)} className="flex-[2] py-5 bg-gold-500 text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold-600 shadow-2xl">Confirm Session</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowRejectModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#151515] border border-white/10 p-6 sm:p-12 rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <span className="text-red-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Master Verdict</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-light text-white mb-4 italic">Decline <span className="text-red-500 not-italic tracking-widest">Entry</span></h3>
              <p className="text-white/30 text-sm mb-10 font-light italic">Master, specify the rationale for this dismissal.</p>
              <textarea 
                placeholder="Rationale (e.g. Tactical schedule conflict)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-40 bg-[#0c0c0c] border border-white/5 p-6 text-white text-sm mb-10 focus:border-red-500 outline-none resize-none rounded-none placeholder:text-white/10"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowRejectModal(null)} className="flex-1 py-5 border border-white/5 text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-white">Stay Verdict</button>
                <button onClick={() => handleReject(showRejectModal)} className="flex-[2] py-5 bg-red-600 text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-red-700 shadow-2xl">Issue Dismissal</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [currentPath, setCurrentPath] = useState("/");
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("mohtade_admin_token"));

  useEffect(() => {
    // Basic router logic for MVP
    const path = window.location.pathname;
    if (path === "/admin" && !adminToken) setCurrentPath("/admin/login");
    else setCurrentPath(path);
  }, [adminToken]);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const onAdminLogin = (token: string) => {
    localStorage.setItem("mohtade_admin_token", token);
    setAdminToken(token);
    navigate("/admin");
  };

  const onAdminLogout = () => {
    localStorage.removeItem("mohtade_admin_token");
    setAdminToken(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden selection:bg-gold-600/30">
      <Navbar onNavigate={navigate} currentPath={currentPath} isAdmin={!!adminToken} />
      
      <main>
        {currentPath === "/" && <HomePage onBook={() => navigate("/book")} />}
        {currentPath === "/book" && <BookingPage onSuccess={() => navigate("/success")} />}
        {currentPath === "/success" && <SuccessPage onHome={() => navigate("/")} />}
        {currentPath === "/admin/login" && <AdminLoginPage onLogin={onAdminLogin} />}
        {currentPath === "/admin" && adminToken && <AdminDashboard token={adminToken} onLogout={onAdminLogout} />}
      </main>

      <footer className="py-12 sm:py-20 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scissors className="text-gold-500 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Mohtade’s Shop</h2>
          <p className="text-zinc-600 max-w-md mx-auto mb-10 font-light text-sm">Providing world-class grooming services since 2010. Tradition, Precision, Style.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8 sm:mb-12">
            {["Instagram", "Facebook", "Twitter", "TikTok"].map(social => (
              <a key={social} href="#" className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-zinc-500 hover:text-gold-500 transition-colors">{social}</a>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-800 font-bold">© 2024 MOHTADE’S SHOP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

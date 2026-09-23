"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Stethoscope,
  Clock,
  User,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Lock,
  Phone,
  FileText,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/navbar/Navbar";
import Footer from "@/app/footer/Footer";
import API_BASE_URL from "@/src/lib/apiConfig";


export default function BookingPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [fullyBookedSlots, setFullyBookedSlots] = useState<string[]>([]);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [userRole, setUserRole] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const watchDoctorId = watch("doctorId");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role || localStorage.getItem("role") || "patient");
      } catch (e) {
        setUserRole(localStorage.getItem("role") || "patient");
      }
    } else {
      setUserRole("guest");
    }
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE_URL}/api/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setDoctors(await res.json());
      } catch (error) {
        console.error("Failed to fetch doctors");
      }
    };
    if (userRole === "patient") fetchDoctors();
  }, [userRole]);

  useEffect(() => {
    if (watchDoctorId && selectedDate) {
      const dayOfWeek = format(parseISO(selectedDate), "EEEE");
      const selectedDoctor = doctors.find((doc) => doc._id === watchDoctorId);
      if (selectedDoctor?.availability) {
        const scheduleForDay = selectedDoctor.availability.find(
          (a: any) => a.day === dayOfWeek,
        );
        const rawTimes = scheduleForDay ? scheduleForDay.times : [];
        // Show the exact slots the doctor configured — no splitting
        setAvailableTimes(rawTimes);
      } else {
        setAvailableTimes([]);
      }
      setSelectedSlot("");

      const fetchAvailability = async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/appointments/check-availability?doctorId=${watchDoctorId}&date=${selectedDate}`,
          );
          if (res.ok) {
            const data = await res.json();
            setFullyBookedSlots(data.fullyBookedSlots || []);
            setSlotCounts(data.slotCounts || {});
          }
        } catch (error) {
          console.error("Failed to fetch availability", error);
        }
      };
      fetchAvailability();
    } else {
      setAvailableTimes([]);
      setFullyBookedSlots([]);
      setSlotCounts({});
    }
  }, [watchDoctorId, selectedDate, doctors]);

  const onSubmit = async (data: any) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: data.doctorId,
          date: selectedDate,
          time: selectedSlot,
          patientName: data.name,
          phone: data.phone,
          reasonForVisit: data.reason,
        }),
      });
      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push("/patient"), 3000);
      } else {
        const errData = await response.json();
        alert("Failed to book appointment: " + errData.message);
      }
    } catch (error) {
      alert("Server Error. Could not connect.");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm focus:bg-white/80 focus:border-[#35838D] focus:outline-none focus:ring-4 focus:ring-[#35838D]/20 transition-all font-semibold text-slate-700 placeholder:text-slate-400 text-sm shadow-sm";

  const labelClass =
    "flex items-center gap-2 text-[11px] font-black text-[#0f4c5c] mb-2 uppercase tracking-widest";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #e0f2f7 0%, #c8e8f0 40%, #d4eef4 70%, #e8f5f8 100%)",
      }}
    >
      <Navbar />

      {/* Decorative blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#35838D]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#0f4c5c]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-grow flex items-center justify-center px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#0f4c5c] hover:text-[#35838D] transition-all font-bold text-sm mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          {/* Glass Card */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl border border-white/60 relative"
            style={{
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Card Header */}
            <div
              className="px-8 pt-8 pb-6 border-b border-white/40"
              style={{
                background:
                  "linear-gradient(135deg, rgba(15,76,92,0.08) 0%, rgba(53,131,141,0.05) 100%)",
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f4c5c] to-[#35838D] flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-[#0f4c5c] tracking-tight">
                    Book an Appointment
                  </h1>
                  <p className="text-xs text-[#597e88] font-semibold">
                    Fill in the details below to schedule your visit
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-8 py-8">
              {/* Loading State */}
              {userRole === null ? (
                <div className="flex items-center justify-center py-16 text-[#0f4c5c] font-black uppercase tracking-widest text-sm animate-pulse">
                  Loading...
                </div>
              ) : userRole !== "patient" ? (
                /* Access Denied */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-12 px-6"
                >
                  <div className="w-16 h-16 bg-[#35838D]/15 rounded-full flex items-center justify-center mb-5 border border-[#35838D]/30 shadow-lg">
                    <Lock className="w-7 h-7 text-[#0f4c5c]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#0f4c5c] mb-3">
                    Patient Access Only
                  </h2>
                  <p className="text-[#597e88] text-sm font-semibold mb-8 max-w-sm leading-relaxed">
                    Please log in as a patient to book an appointment through this portal.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] text-white px-6 py-3 rounded-full font-black text-sm hover:brightness-110 transition-all shadow-lg"
                  >
                    Log In as Patient
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {isSuccess ? (
                    /* Success State */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-5 shadow-lg"
                      >
                        <CheckCircle2 className="w-10 h-10 text-teal-500" />
                      </motion.div>
                      <h2 className="text-2xl font-black text-[#0f4c5c] mb-2">
                        Booking Confirmed! 🎉
                      </h2>
                      <p className="text-[#597e88] text-sm font-semibold mb-4">
                        Your appointment has been successfully scheduled.
                      </p>
                      <p className="text-[#e58221] font-black animate-pulse tracking-widest text-[10px] uppercase">
                        Redirecting to your dashboard...
                      </p>
                    </motion.div>
                  ) : (
                    /* Booking Form */
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Select Specialist */}
                      <div>
                        <label className={labelClass}>
                          <Stethoscope className="w-3.5 h-3.5 text-[#e58221]" />
                          Select Specialist
                        </label>
                        <select
                          {...register("doctorId", { required: true })}
                          className={inputClass}
                        >
                          <option value="">Choose a doctor...</option>
                          {doctors.map((doc) => (
                            <option key={doc._id} value={doc._id}>
                              Dr. {doc.name} — {doc.specialization}
                            </option>
                          ))}
                        </select>
                        {errors.doctorId && (
                          <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">
                            Please select a doctor.
                          </p>
                        )}
                      </div>

                      {/* Date & Time Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Date */}
                        <div>
                          <label className={labelClass}>
                            <Calendar className="w-3.5 h-3.5 text-[#e58221]" />
                            Select Date
                          </label>
                          <input
                            type="date"
                            value={selectedDate}
                            min={format(new Date(), "yyyy-MM-dd")}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                            className={inputClass}
                          />
                        </div>

                        {/* Time Slots */}
                        <div>
                          <label className={labelClass}>
                            <Clock className="w-3.5 h-3.5 text-[#e58221]" />
                            Select Time
                          </label>
                          {!watchDoctorId ? (
                            <div className="px-4 py-3 rounded-2xl bg-white/50 border border-white/40 text-slate-400 text-xs font-semibold">
                              Select a doctor first.
                            </div>
                          ) : !selectedDate ? (
                            <div className="px-4 py-3 rounded-2xl bg-white/50 border border-white/40 text-slate-400 text-xs font-semibold">
                              Select a date to see times.
                            </div>
                          ) : availableTimes.length === 0 ? (
                            <div className="px-4 py-3 rounded-2xl bg-red-50/80 border border-red-200/60 text-red-500 text-xs font-bold">
                              Not available on this date.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1.5 max-h-[130px] overflow-y-auto pr-1">
                              {availableTimes.map((slot) => {
                                const count = slotCounts[slot] || 0;
                                const maxCapacity = 3;
                                const isFull =
                                  fullyBookedSlots.includes(slot) ||
                                  count >= maxCapacity;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    disabled={isFull}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 px-2 rounded-xl text-[10px] font-black transition-all shadow-sm flex flex-col items-center justify-center ${
                                      isFull
                                        ? "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                                        : selectedSlot === slot
                                          ? "bg-gradient-to-r from-[#0f4c5c] to-[#35838D] text-white shadow-md scale-95 border-transparent"
                                          : "bg-white/70 text-[#0f4c5c] border border-white/60 hover:bg-[#35838D]/20 hover:border-[#35838D]/40"
                                    }`}
                                  >
                                    <span>{slot}</span>
                                    <span
                                      className={`text-[8px] mt-0.5 font-bold ${
                                        selectedSlot === slot
                                          ? "text-white/80"
                                          : "text-[#597e88]"
                                      }`}
                                    >
                                      {isFull ? "Full" : `${count}/3`}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/60" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-3 text-[10px] font-black uppercase tracking-widest text-[#597e88] bg-transparent">
                            Patient Information
                          </span>
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>
                            <User className="w-3.5 h-3.5 text-[#e58221]" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Your full name"
                            {...register("name", { required: true })}
                            className={inputClass}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">
                              Name is required.
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelClass}>
                            <Phone className="w-3.5 h-3.5 text-[#e58221]" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="Your phone number"
                            {...register("phone", { required: true })}
                            className={inputClass}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">
                              Phone is required.
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>
                            <FileText className="w-3.5 h-3.5 text-[#e58221]" />
                            Reason for Visit
                            <span className="text-slate-400 normal-case tracking-normal font-medium ml-1">
                              (optional)
                            </span>
                          </label>
                          <textarea
                            placeholder="Brief description of your symptoms or reason..."
                            rows={3}
                            {...register("reason")}
                            className={`${inputClass} resize-none`}
                          />
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={!selectedDate || !selectedSlot}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 shadow-xl shadow-[#0f4c5c]/20 uppercase tracking-wider"
                      >
                        Confirm Appointment
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* Trust badges */}
                      <div className="flex items-center justify-center gap-6 pt-1">
                        <div className="flex items-center gap-1.5 text-[#597e88] text-[10px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                          Verified Specialists
                        </div>
                        <div className="flex items-center gap-1.5 text-[#597e88] text-[10px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                          Instant Confirmation
                        </div>
                        <div className="flex items-center gap-1.5 text-[#597e88] text-[10px] font-semibold">
                          <Lock className="w-3 h-3 text-teal-500" />
                          Secure Booking
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

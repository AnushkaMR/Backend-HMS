"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  PlusCircle,
  Trash2,
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  Activity,
} from "lucide-react";
import Navbar from "@/app/navbar/Navbar"; // Adjust this path if your Navbar is somewhere else!
import Footer from "../footer/Footer";

export default function PatientDashboard() {
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/appointments/my-appointments",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setMyAppointments(await res.json());
      } else {
        setError("Failed to load your appointments.");
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle Cancelling Appointment
  const handleCancelAppointment = async (apptId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );
    if (!confirmCancel) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${apptId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        // Instantly remove the appointment from the screen with a smooth animation!
        setMyAppointments((prevAppointments) =>
          prevAppointments.filter((appt) => appt._id !== apptId),
        );
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel appointment.");
      }
    } catch (error) {
      alert("An error occurred while trying to cancel.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9fa] via-[#e6f7f8] to-[#edf5f5] flex flex-col">
      {/* 1. SMART NAVBAR */}
      <Navbar />

      {/* 2. MAIN CONTENT */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-6 sm:px-12 lg:px-20 py-4 sm:py-6">
        {/* HEADER AREA */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 mt-3"
        >
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0f4c5c] tracking-tight flex items-center">
              My Dashboard
            </h1>
            <p className="text-[#597e88] font-semibold mt-1 text-sm">
              Manage your health and upcoming visits.
            </p>
          </div>

          <Link
            href="/patient/book"
            className="flex items-center bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] text-white px-4 py-2.5 rounded-md font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-teal-900/10 hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Book New Appointment
          </Link>
        </motion.div>

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50/70 backdrop-blur-sm p-3 rounded-md border border-red-100/60 text-red-600 font-black mb-5 text-center shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* APPOINTMENTS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 backdrop-blur-xl p-4 sm:p-6 rounded-lg shadow-xl border border-[#35838D]/50"
        >
          <h2 className="text-base font-black text-[#0f4c5c] mb-5 flex items-center border-b border-[#35838D]/30 pb-3 uppercase tracking-tight">
            <CalendarDays className="w-4 h-4 mr-2 text-[#e58221]" />
            Upcoming Appointments
          </h2>

          {isLoading ? (
            <div className="text-center py-8 text-[#597e88] font-black animate-pulse text-sm">
              Loading your schedule...
            </div>
          ) : myAppointments.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-10 bg-white/40 backdrop-blur-sm rounded-md border border-dashed border-[#35838D]/60 flex flex-col items-center">
              <Calendar className="w-10 h-10 text-[#0f4c5c] mb-3 opacity-50" />
              <p className="text-[#0f4c5c] font-black text-base mb-1">
                You are all caught up!
              </p>
              <p className="text-[#597e88] font-semibold mb-4 text-sm">
                You have no upcoming appointments scheduled.
              </p>
              <Link
                href="/patient/book"
                className="text-white font-black hover:brightness-110 transition-all flex items-center bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] px-4 py-2.5 rounded-md shadow-md text-sm"
              >
                Find a Specialist
              </Link>
            </div>
          ) : (
            /* LIST OF APPOINTMENTS */
            <div className="flex flex-col gap-2.5">
              <AnimatePresence>
                {myAppointments.map((appt) => (
                  <motion.div
                    key={appt._id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      height: 0,
                      marginBottom: 0,
                      padding: 0,
                      overflow: "hidden",
                    }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white/60 backdrop-blur-md border border-white/60 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-[0_4px_24px_rgba(15,76,92,0.06)] transition-all gap-4 group"
                  >
                    {/* Doctor Details */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/80 border border-slate-200/60 rounded-full flex items-center justify-center text-[#e58221] shadow-sm shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0f4c5c] mb-0.5">
                          {appt.doctorId?.name || "Unknown Doctor"}
                        </p>
                        <p className="text-[#e58221] font-black text-[10px] uppercase tracking-wider">
                          {appt.doctorId?.specialization}
                        </p>
                      </div>
                    </div>

                    {/* Time and Cancel Button */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-[#35838D]/30 md:border-t-0 pt-3 md:pt-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200/60 shadow-sm w-full sm:w-auto">
                        <div className="flex items-center text-[#0f4c5c] font-black text-xs">
                          <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-[#e58221]" />{" "}
                          {appt.date}
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-slate-200/60"></div>
                        <div className="flex items-center text-[#0f4c5c] font-black text-xs">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-[#e58221]" />{" "}
                          {appt.time}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelAppointment(appt._id)}
                        className="p-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-400 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                        title="Cancel Appointment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

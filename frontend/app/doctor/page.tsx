"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/navbar/Navbar"; // Adjust if your Navbar is saved elsewhere!
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Phone,
  User,
  Save,
  CheckCircle2,
  Stethoscope,
  Users,
  Trash2,
} from "lucide-react";
import API_BASE_URL from "@/src/lib/apiConfig";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = [
  "10:00 AM - 12:00 PM",
  "2:00 PM - 4:00 PM",
  "6:00 PM - 8:00 PM",
];

export default function DoctorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // This object holds the grid data
  const [schedule, setSchedule] = useState<Record<string, string[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch Profile
    const profRes = await fetch(`${API_BASE_URL}/api/doctor/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (profRes.ok) {
      const data = await profRes.json();
      setProfile(data);

      // Load existing availability
      if (data.availability) {
        const loadedSchedule: Record<string, string[]> = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        };
        data.availability.forEach((item: any) => {
          loadedSchedule[item.day] = item.times;
        });
        setSchedule(loadedSchedule);
      }
    }

    // Fetch Booked Appointments
    const apptRes = await fetch(
      `${API_BASE_URL}/api/appointments/my-appointments`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (apptRes.ok) setAppointments(await apptRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle a specific time slot
  const toggleTimeSlot = (day: string, slot: string) => {
    setSchedule((prev) => {
      const daySlots = prev[day];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter((s) => s !== slot) };
      } else {
        return { ...prev, [day]: [...daySlots, slot] };
      }
    });
  };

  const handleSetAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formattedAvailability = Object.keys(schedule)
      .filter((day) => schedule[day].length > 0)
      .map((day) => ({
        day,
        times: schedule[day],
      }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/doctor/availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability: formattedAvailability }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Availability saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error: " + data.message);
      }
    } catch (error) {
      setMessage("Error saving availability.");
    }
  };

  // Handle Cancelling Appointment
  const handleCancelAppointment = async (apptId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment? The patient will no longer see it on their dashboard.",
    );
    if (!confirmCancel) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${apptId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        // Instantly remove the appointment from the screen with a smooth animation
        setAppointments((prev) => prev.filter((appt) => appt._id !== apptId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel appointment.");
      }
    } catch (error) {
      alert("An error occurred while trying to cancel.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. SMART NAVBAR */}
      <Navbar />

      {/* 2. MAIN CONTENT */}
      <div className="flex-grow px-6 sm:px-12 lg:px-20 py-4 sm:py-6 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 mt-3"
        >
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Doctor Control Panel
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Manage your schedule and view upcoming patients.
          </p>
        </motion.div>

        {/* PROFILE CARD - Rebuilt without absolute positioning */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-lg shadow-sm border border-slate-100 mb-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

            <div className="w-20 h-20 bg-slate-100 rounded-full overflow-hidden shrink-0 border-3 border-white shadow-md relative z-10">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left relative z-10 mt-1">
              <h2 className="text-xl font-extrabold text-slate-800">
                Dr. {profile.name}
              </h2>
              <div className="flex items-center justify-center sm:justify-start mt-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 font-bold text-xs">
                <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                {profile.specialization}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* MANAGE SCHEDULE GRID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-100"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-3 border-b border-slate-100 gap-3">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center">
                <CalendarDays className="w-4 h-4 mr-2 text-blue-600" /> Manage
                Schedule
              </h2>
              {message && (
                <div className="flex items-center font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs border border-emerald-100 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {message}
                </div>
              )}
            </div>

            <form onSubmit={handleSetAvailability}>
              <div className="flex flex-col gap-2.5 mb-5">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-slate-50 p-3 rounded-md border border-slate-100"
                  >
                    <div className="w-24 font-bold text-slate-700 flex items-center text-sm">
                      {day}
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = schedule[day].includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleTimeSlot(day, slot)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5 ${
                              isSelected
                                ? "bg-slate-800 text-white shadow-md border-transparent"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-700 transition-all text-sm shadow-md hover:-translate-y-0.5"
              >
                <Save className="w-4 h-4 mr-2" /> Save My Schedule
              </button>
            </form>
          </motion.div>

          {/* MY PATIENTS LIST */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-100 h-fit"
          >
            <h2 className="text-base font-extrabold mb-4 text-slate-800 flex items-center border-b border-slate-100 pb-3">
              <Users className="w-4 h-4 mr-2 text-blue-600" /> Upcoming Visits
            </h2>

            {appointments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed border-slate-200">
                <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium text-sm">
                  No appointments booked yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <AnimatePresence>
                  {appointments.map((appt) => (
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
                      className="p-3.5 bg-slate-50 border border-slate-100 rounded-md hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-0.5">
                        <h3 className="font-extrabold text-slate-800 text-sm">
                          {appt.patientName}
                        </h3>
                        <button
                          onClick={() => handleCancelAppointment(appt._id)}
                          className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm shrink-0 ml-2"
                          title="Cancel Appointment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-slate-500 flex items-center mb-2.5">
                        <Phone className="w-3.5 h-3.5 mr-1.5" /> {appt.phone}
                      </p>
                      <div className="flex items-center justify-between bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg shadow-sm">
                        <div className="flex items-center text-xs font-bold">
                          <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-blue-500" />{" "}
                          {appt.date}
                        </div>
                        <div className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md">
                          <Clock className="w-3.5 h-3.5 mr-1" />{" "}
                          {appt.time.split(" - ")[0]}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

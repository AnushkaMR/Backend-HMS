"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, User, ChevronRight, AlertCircle } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import API_BASE_URL from "@/src/lib/apiConfig";

// --- ANIMATION SETTINGS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

const getImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return `${API_BASE_URL}/${imagePath}`;
};

export default function DoctorsListingPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // PUBLIC FETCH LOGIC
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/doctors`);

        if (res.ok) {
          setDoctors(await res.json());
        } else {
          // 🔴 This will now tell you the EXACT status code causing the crash
          setErrorMessage(`Server rejected request with status: ${res.status}`);
        }
      } catch (error) {
        setErrorMessage("Server connection error. Is your backend running?");
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="py-10 max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 flex-grow w-full">
        {/* HEADER ANIMATION */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 border-b-2 border-slate-200 pb-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
            Our Specialists
          </h1>
        </motion.div>

        {/* 🔴 DIAGNOSTIC ERROR MESSAGE DISPLAY */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-5 flex flex-col items-center justify-center text-center font-bold mb-6 shadow-sm">
            <AlertCircle className="w-8 h-8 mb-3 text-red-500" />
            <p className="text-base mb-1.5">{errorMessage}</p>

            {/* Auto-tips based on what the server is responding with */}
            {errorMessage.includes("401") && (
              <p className="text-sm font-medium text-red-500 max-w-lg">
                Tip: Status 401 means you still have the "authenticateToken"
                middleware on your backend route! Remove it and restart your
                Express server.
              </p>
            )}
            {errorMessage.includes("500") && (
              <p className="text-sm font-medium text-red-500 max-w-lg">
                Tip: Status 500 means your backend code crashed. Check your
                Express terminal to see the MongoDB error!
              </p>
            )}
          </div>
        )}

        {/* --- ANIMATED GRID --- */}
        {!errorMessage && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {doctors.map((doc) => {
              const imageUrl = getImageUrl(doc.image);

              return (
                <motion.div
                  key={doc._id}
                  variants={cardVariants}
                  whileHover={{
                    y: -8,
                    boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
                  }}
                  className="bg-white rounded-none p-0 shadow-sm border border-slate-200 transition-all flex flex-col items-center text-center group overflow-hidden"
                >
                  <div className="w-full h-56 bg-slate-100 flex items-center justify-center border-b border-slate-100 overflow-hidden relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={doc.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <User className="w-12 h-12 text-slate-300" />
                    )}

                    <div className="absolute top-3 right-3 flex items-center justify-center bg-white/90 backdrop-blur-sm text-yellow-600 px-2 py-0.5 rounded-none shadow-sm text-xs font-bold border border-yellow-100">
                      <Star className="w-3.5 h-3.5 mr-0.5 fill-current" />
                      {doc.rating || "New"}
                    </div>
                  </div>

                  <div className="p-5 w-full flex flex-col items-center flex-grow">
                    <h2 className="text-lg font-bold text-slate-800 mb-0.5">
                      {doc.name}
                    </h2>
                    <p className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-4">
                      {doc.specialization}
                    </p>

                    <Link
                      href={`/doctors/${doc._id}`}
                      className="w-full mt-auto flex items-center justify-center bg-slate-800 text-white py-3 rounded-none font-bold text-sm group-hover:bg-blue-600 transition-colors"
                    >
                      View Full Profile
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* LOADING STATE */}
        {!errorMessage && doctors.length === 0 && (
          <div className="text-center py-14 text-slate-500 text-base font-bold animate-pulse flex flex-col items-center">
            <User className="w-8 h-8 mb-3 text-slate-300" />
            Loading specialists...
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

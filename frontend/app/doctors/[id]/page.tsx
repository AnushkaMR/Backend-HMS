"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, User, Calendar, Clock, ArrowLeft, ChevronRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/app/navbar/Navbar"; // 🔴 Check this path matches your project!
import Footer from "@/app/footer/Footer";

const getImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/")) {
    return `http://localhost:5000${imagePath}`;
  }
  return `http://localhost:5000/${imagePath}`;
};

export default function DoctorDetailsPage() {
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Grabs the exact doctor ID from the URL bar
  const params = useParams();
  const doctorId = params?.id;

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      // 1. Grab the token so the backend bouncer lets us in!
      const token = localStorage.getItem("token");
      
      if (!token) {
        setErrorMessage("You must log in to view doctor profiles.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/doctors/${doctorId}`, {
          // 2. Attach the token to the request
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          setDoctor(await res.json());
        } else if (res.status === 401 || res.status === 403) {
          setErrorMessage("Session expired. Please log in again.");
        } else {
          setErrorMessage("Doctor not found or server error.");
        }
      } catch (error) {
        setErrorMessage("Failed to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (doctorId) fetchDoctorDetails();
  }, [doctorId]);

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-xl font-bold text-slate-500 animate-pulse">
          <User className="w-12 h-12 mb-4 text-slate-300" />
          Loading Specialist Profile...
        </div>
      </div>
    );
  }

  // Handle Error State (If blocked by backend or doctor doesn't exist)
  if (errorMessage || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4 shadow-sm rounded-full bg-red-50" />
          <div className="text-red-600 font-bold text-2xl mb-2">Access Denied</div>
          <p className="text-slate-600 font-medium mb-8 max-w-md">{errorMessage}</p>
          <Link href="/doctors" className="bg-slate-800 text-white px-8 py-4 font-bold hover:bg-blue-600 transition-colors flex items-center shadow-md hover:-translate-y-1 rounded-xl w-fit mx-auto">
            <ArrowLeft className="w-5 h-5 mr-2" /> Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(doctor.image);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      <Navbar />

      <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        <Link href="/doctors" className="inline-flex items-center text-slate-500 font-bold hover:text-blue-600 mb-8 transition-colors bg-white px-4 py-2 border border-slate-200 shadow-sm rounded-lg hover:bg-blue-50">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to All Specialists
        </Link>

        {/* ANIMATED PROFILE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 sm:p-10 shadow-lg border border-slate-100 flex flex-col relative"
        >
          
          {/* Top Section: Profile Picture and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-10 pb-10 border-b border-slate-100">
            {/* Small Profile Image */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-slate-100 rounded-full flex items-center justify-center relative overflow-hidden shadow-md border-4 border-white">
              {imageUrl ? (
                <img src={imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-300" />
              )}
            </div>

            {/* Doctor Info */}
            <div className="flex-1 text-center sm:text-left flex flex-col justify-center py-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
                {doctor.name}
              </h1>
              <p className="text-base sm:text-xl text-blue-600 font-bold uppercase tracking-wider mb-4">
                {doctor.specialization}
              </p>
              
              <div className="inline-flex items-center justify-center sm:justify-start bg-yellow-50 text-yellow-700 px-4 py-2 shadow-sm text-sm font-bold border border-yellow-200 rounded-full w-fit mx-auto sm:mx-0">
                <Star className="w-5 h-5 mr-1 fill-current" />
                {doctor.rating || "New"} Rating
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 flex flex-col">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-600" /> Weekly Availability
              </h3>
              
              {doctor.availability && doctor.availability.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  {doctor.availability.map((avail: any, index: number) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 p-4 hover:border-blue-300 transition-colors rounded-xl shadow-sm">
                      <p className="font-extrabold text-slate-800 mb-2 border-b border-slate-200 pb-2">{avail.day}</p>
                      <div className="flex flex-col gap-2 mt-3">
                        {avail.times.map((time: string, i: number) => (
                          <div key={i} className="flex items-center justify-center text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm hover:bg-slate-50 transition-colors w-full">
                            <Clock className="w-4 h-4 mr-2 text-blue-500 shrink-0" /> 
                            <span>{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 p-8 text-center text-slate-500 font-medium mb-10 rounded-xl">
                  This specialist has not published their schedule yet.
                </div>
              )}
            </div>

            {/* Link to booking page */}
            <Link 
              href="/patient/book" 
              className="bg-blue-600 text-white text-center py-4 px-8 font-bold hover:bg-blue-700 transition-all flex items-center justify-center group shadow-md rounded-xl text-lg mt-auto sm:w-fit sm:ml-auto"
            >
              Book an Appointment <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </motion.div>
      </div>
      <Footer/>
    </div>
  );
}

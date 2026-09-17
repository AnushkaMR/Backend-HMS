"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// Added Menu and X icons for the mobile toggle
import { User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/login"); // Default to login if guest
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🔴 NEW: Tracks if mobile menu is open

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);

      // Determine where the dashboard link should go based on role
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "doctor") setDashboardUrl("/doctor");
        else if (payload.role === "admin") setDashboardUrl("/admin");
        else setDashboardUrl("/patient");
      } catch (e) {
        // Fallback to local storage role if token decoding fails
        const role = localStorage.getItem("role");
        if (role === "doctor") setDashboardUrl("/doctor");
        else if (role === "admin") setDashboardUrl("/admin");
        else setDashboardUrl("/patient");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <nav className="relative flex justify-between items-center px-6 md:px-12 py-4 bg-[#ADD5ED] shadow-sm md:pl-40 md:pr-40 z-50">
      {/* LOGO */}
      <div className="text-3xl font-extrabold tracking-tighter text-slate-900 italic">
        LOGO
      </div>

      {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
      <div className="hidden md:flex gap-8 font-medium text-xl text-slate-800 items-center">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        <Link href="/doctors" className="hover:text-white transition">
          Doctors
        </Link>
        <Link href="/patient/book" className="hover:text-white transition">
          Appointments
        </Link>
        <Link
          href={dashboardUrl}
          className="flex items-center gap-1 hover:text-white transition group"
        >
          Dashboard
        </Link>
      </div>

      {/* --- DESKTOP BUTTONS (Hidden on Mobile) --- */}
      <div className="hidden md:flex items-center relative group px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 ease-in-out">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 text-white backdrop-blur-sm px-6 py-2 rounded-full font-semibold text-lg shadow-sm hover:bg-white/30 transition border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Logout <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white/20 text-white backdrop-blur-sm px-6 py-2 rounded-full font-semibold text-lg shadow-sm hover:bg-white/30 transition border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Login <User className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
      {/* --- MOBILE HAMBURGER BUTTON --- */}
      <button
        className="md:hidden text-slate-900 p-2 focus:outline-none hover:text-white transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <Menu className="w-8 h-8" />
        )}
      </button>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b-4 border-slate-900 shadow-2xl flex flex-col md:hidden z-50">
          <div className="flex flex-col divide-y divide-slate-100">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-8 py-4 text-xl font-bold text-slate-800 hover:bg-[#35838D] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/doctors"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-8 py-4 text-xl font-bold text-slate-800 hover:bg-[#35838D] transition-colors"
            >
              Doctors
            </Link>
            <Link
              href="/patient/book"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-8 py-4 text-xl font-bold text-slate-800 hover:bg-[#35838D] transition-colors"
            >
              Appointments
            </Link>
            <Link
              href={dashboardUrl}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-8 py-4 text-xl font-bold text-slate-800 hover:bg-[#35838D] transition-colors"
            >
              Dashboard
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="p-6 bg-slate-50">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex justify-center items-center gap-2 bg-red-50 text-red-600 px-5 py-4 rounded-none font-bold text-xl border-2 border-red-200 hover:bg-red-100 transition"
                >
                  Logout <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-5 py-4 rounded-s font-bold text-xl hover:bg-blue-600 transition"
                >
                  Login <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

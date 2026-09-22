"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, UserPlus, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "@/src/lib/apiConfig";

interface RegisterResponse {
  message: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false); // Only stop loading if there is an error, otherwise keep it spinning until redirect
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* --- SMART NAVBAR --- */}
      <Navbar />

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex items-center justify-center px-6 sm:px-12 lg:px-20 py-4">
        <div className="w-full max-w-sm bg-white rounded-lg p-7 shadow-lg border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-500 mt-1 font-medium text-xs">
              Join our platform to book and manage appointments.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-bold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-100 p-3 text-xs text-green-700 font-bold text-center flex flex-col items-center">
              <span className="text-base mb-0.5">🎉</span>
              Account created successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* EMAIL INPUT */}
            <div className="relative">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || success}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="relative">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || success}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD INPUT */}
            <div className="relative">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || success}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full flex items-center justify-center rounded-lg bg-slate-800 px-4 py-3 font-bold text-sm text-white transition-all hover:bg-blue-600 hover:-translate-y-0.5 shadow-md disabled:bg-slate-400 disabled:hover:translate-y-0 mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating
                  Account...
                </>
              ) : success ? (
                "Success!"
              ) : (
                <>
                  Register <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-6 text-center text-xs font-medium text-slate-500 border-t border-slate-100 pt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

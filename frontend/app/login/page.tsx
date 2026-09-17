"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/app/navbar/Navbar"; // Ensure this path correctly points to your Navbar!
import { GoogleLogin } from "@react-oauth/google";

interface LoginResponse {
  message: string;
  token?: string;
  role?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Google auth failed");
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.role) localStorage.setItem("role", data.role);
        
        setIsSuccess(true);
        setTimeout(() => {
          if (data.role === "doctor") {
            router.push("/doctor");
          } else if (data.role === "patient") {
            router.push("/patient");
          } else if (data.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/patient");
          }
        }, 800);
      } else {
        throw new Error("No token received from server");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      if (data.token) {
        // Save token and role to localStorage
        localStorage.setItem("token", data.token);
        if (data.role) localStorage.setItem("role", data.role);
        
        setIsSuccess(true); // Triggers the success UI state

        // Redirect based on role
        setTimeout(() => {
          if (data.role === "doctor") {
            router.push("/doctor");
          } else if (data.role === "patient") {
            router.push("/patient");
          } else if (data.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/patient");
          }
        }, 800); // Short delay so the user sees the "Success" state

      } else {
        throw new Error("No token received from server");
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      setIsLoading(false); // Only turn off loading if there's an error
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
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <LogIn className="w-6 h-6 ml-0.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 mt-1 font-medium text-xs">
              Log in to manage your appointments and schedule.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* EMAIL INPUT */}
            <div className="relative">
              <label className="mb-1 block text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="relative">
              <label className="mb-1 block text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full flex items-center justify-center rounded-lg px-4 py-3 font-bold text-sm text-white transition-all shadow-md mt-1
                ${isSuccess ? 'bg-green-500 hover:bg-green-500' : 'bg-slate-800 hover:bg-blue-600 hover:-translate-y-0.5'}
                ${(isLoading && !isSuccess) ? 'bg-slate-400 hover:bg-slate-400 hover:translate-y-0 cursor-not-allowed' : ''}
              `}
            >
              {isLoading && !isSuccess ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Authenticating...
                </>
              ) : isSuccess ? (
                "Login Successful!"
              ) : (
                <>
                  Log In <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* GOOGLE DIVIDER */}
          <div className="mt-6 flex items-center justify-center">
            <span className="w-full border-t border-slate-200"></span>
            <span className="px-3 text-xs font-medium text-slate-400 bg-white">OR</span>
            <span className="w-full border-t border-slate-200"></span>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="mt-4 flex justify-center w-full [&>div]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Authentication Failed")}
              theme="outline"
              size="large"
              shape="rectangular"
              width="300"
            />
          </div>

          {/* REGISTER LINK */}
          <div className="mt-6 text-center text-xs font-medium text-slate-500 border-t border-slate-100 pt-4">
            Don't have an account yet?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              Sign up here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

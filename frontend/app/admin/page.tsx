"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Mail,
  Lock,
  Briefcase,
  Star,
  Image as ImageIcon,
  User,
  Activity,
  AlignLeft,
  Plus,
  MessageSquare,
} from "lucide-react";
import Footer from "../footer/Footer";
import API_BASE_URL from "@/src/lib/apiConfig";

export default function AdminDashboard() {
  // --- DOCTOR STATE ---
  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    rating: "",
  });
  const [doctorImage, setDoctorImage] = useState<File | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorMsg, setDoctorMsg] = useState("");

  // --- SERVICE STATE ---
  const [serviceData, setServiceData] = useState({ name: "", description: "" });
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [serviceMsg, setServiceMsg] = useState("");

  // --- REVIEW STATE ---
  const [reviewData, setReviewData] = useState({
    name: "",
    review: "",
  });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewMsg, setReviewMsg] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);

  // Fetch all data when the page loads
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      // Fetch Doctors
      const resDocs = await fetch(`${API_BASE_URL}/api/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resDocs.ok) setDoctors(await resDocs.json());

      // Fetch Services
      const resServs = await fetch(`${API_BASE_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resServs.ok) setServices(await resServs.json());

      // Fetch Reviews
      const resReviews = await fetch(`${API_BASE_URL}/api/reviews`);
      if (resReviews.ok) setReviews(await resReviews.json());
    } catch (error) {
      console.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- DOCTOR HANDLERS ---
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const dataToSend = new FormData();
    dataToSend.append("name", doctorData.name);
    dataToSend.append("email", doctorData.email);
    dataToSend.append("password", doctorData.password);
    dataToSend.append("specialization", doctorData.specialization);
    dataToSend.append("rating", doctorData.rating);
    if (doctorImage) dataToSend.append("image", doctorImage);

    try {
      const response = await fetch(`${API_BASE_URL}/api/create-doctor`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });
      const data = await response.json();
      setDoctorMsg(data.message);

      if (response.ok) {
        setDoctorData({
          name: "",
          email: "",
          password: "",
          specialization: "",
          rating: "",
        });
        setDoctorImage(null);
        (document.getElementById("docImageInput") as HTMLInputElement).value =
          "";
        fetchData();
      }
    } catch (err) {
      setDoctorMsg("Error creating doctor.");
    }
  };

  const handleRemoveDoctor = async (id: string, name: string) => {
    if (!window.confirm(`Remove Dr. ${name}?`)) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setDoctors(doctors.filter((doc) => doc._id !== id));
        alert("✅ Doctor removed.");
      } else alert("❌ Failed to remove doctor.");
    } catch (error) {
      alert("Error removing doctor.");
    }
  };

  // --- SERVICE HANDLERS ---
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const dataToSend = new FormData();
    dataToSend.append("name", serviceData.name);
    dataToSend.append("description", serviceData.description);
    if (serviceImage) {
      dataToSend.append("image", serviceImage);
    } else {
      setServiceMsg("Image is required for services.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });
      const data = await response.json();
      setServiceMsg(data.message || "Service added!");

      if (response.ok) {
        setServiceData({ name: "", description: "" });
        setServiceImage(null);
        (document.getElementById("servImageInput") as HTMLInputElement).value =
          "";
        fetchData();
      }
    } catch (err) {
      setServiceMsg("Error creating service.");
    }
  };

  const handleRemoveService = async (id: string, name: string) => {
    if (!window.confirm(`Remove service: ${name}?`)) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setServices(services.filter((serv) => serv._id !== id));
        alert("✅ Service removed.");
      } else alert("❌ Failed to remove service.");
    } catch (error) {
      alert("Error removing service.");
    }
  };

  // --- REVIEW HANDLERS ---
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReview(true);
    const token = localStorage.getItem("token");

    const dataToSend = new FormData();
    dataToSend.append("name", reviewData.name);
    dataToSend.append("review", reviewData.review);
    if (reviewImage) {
      dataToSend.append("image", reviewImage);
    } else {
      setReviewMsg("Image is required for reviews.");
      setLoadingReview(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });
      const data = await response.json();

      if (response.ok) {
        setReviewData({ name: "", review: "" });
        setReviewImage(null);
        (document.getElementById("revImageInput") as HTMLInputElement).value = "";
        setReviewMsg("Review added successfully.");
        fetchData();
      } else {
        setReviewMsg(data.message || "Error adding review.");
      }
    } catch (err) {
      setReviewMsg("Error creating review.");
    } finally {
      setLoadingReview(false);
    }
  };

  const handleRemoveReview = async (id: string) => {
    if (!window.confirm("Remove this review?")) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setReviews(reviews.filter((r) => r._id !== id));
        alert("✅ Review removed.");
      } else {
        alert("❌ Failed to remove review.");
      }
    } catch (error) {
      alert("Error removing review.");
    }
  };

  return (
    <div>
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9fa] via-[#e6f7f8] to-[#edf5f5] font-sans text-slate-800 pb-20">
      <Navbar />

      <div className="px-6 sm:px-12 lg:px-20 max-w-6xl mx-auto mt-4 sm:mt-8">
        {/* HEADER */}
        <div className="flex items-center mb-5 sm:mb-8 border-b border-teal-500/10 pb-3 sm:pb-4 justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#0f4c5c] via-[#2d7687] to-[#e58221] uppercase">
              Admin Panel
            </h1>
            <p className="text-[#597e88] font-semibold tracking-wider text-[9px] sm:text-[10px] mt-1 uppercase">
              Manage personnel, services, and reviews
            </p>
          </div>
          <span className="bg-[#35838D]/40 text-[#0f4c5c] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border border-[#35838D] text-[10px] sm:text-xs font-black tracking-widest shadow-sm">
            DASHBOARD
          </span>
        </div>

        {/* ========================================================== */}
        {/* SECTION 1: DOCTORS */}
        {/* ========================================================== */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-base sm:text-lg md:text-xl font-black uppercase mb-4 sm:mb-5 flex items-center text-[#0f4c5c]">
            Doctors Directory
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-md sm:rounded-lg border border-[#35838D]/50 shadow-lg shadow-teal-500/5 h-fit">
              <h3 className="text-sm font-extrabold uppercase mb-4 flex items-center border-b border-[#35838D]/50 pb-3 text-[#0f4c5c]">
                Add Doctor
              </h3>

              {doctorMsg && (
                <div className="mb-4 p-3 bg-[#e6f7f8] text-[#0f4c5c] border border-[#35838D] font-bold text-xs uppercase rounded-md backdrop-blur-sm shadow-sm">
                  {doctorMsg}
                </div>
              )}

              <form onSubmit={handleAddDoctor} className="flex flex-col gap-3">
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={doctorData.name}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, name: e.target.value })
                    }
                    className="w-full pl-10 p-3 rounded-md border border-slate-200 bg-white font-semibold text-slate-800 text-sm placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <input
                    type="email"
                    placeholder="Login Email"
                    value={doctorData.email}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, email: e.target.value })
                    }
                    className="w-full pl-10 p-3 rounded-md border border-slate-200 bg-white font-semibold text-slate-800 text-sm placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <input
                    type="password"
                    placeholder="Temp Password"
                    value={doctorData.password}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, password: e.target.value })
                    }
                    className="w-full pl-10 p-3 rounded-md border border-slate-200 bg-white font-semibold text-slate-800 text-sm placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Briefcase className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <input
                    type="text"
                    placeholder="Specialization"
                    value={doctorData.specialization}
                    onChange={(e) =>
                      setDoctorData({
                        ...doctorData,
                        specialization: e.target.value,
                      })
                    }
                    className="w-full pl-10 p-3 rounded-md border border-slate-200 bg-white font-semibold text-slate-800 text-sm placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Star className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Rating (0-5)"
                    value={doctorData.rating}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, rating: e.target.value })
                    }
                    className="w-full pl-10 p-3 rounded-md border border-slate-200 bg-white font-semibold text-slate-800 text-sm placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="relative mt-2">
                  <label className="block text-xs font-black uppercase mb-2 text-[#597e88] tracking-wider">
                    Profile Image
                  </label>
                  <input
                    id="docImageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setDoctorImage(e.target.files?.[0] || null)
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm font-bold cursor-pointer text-[#597e88] file:border-0 file:bg-[#35838D] file:text-[#0f4c5c] file:px-4 file:py-2 file:rounded-md file:mr-3 hover:file:bg-[#71d2da] transition duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] text-white p-3 rounded-md font-black uppercase mt-2 text-sm shadow-lg hover:brightness-110 active:scale-98 transition duration-200"
                >
                  Add Doctor
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-5 rounded-lg border border-[#35838D]/50 shadow-lg shadow-teal-500/5">
              <h3 className="text-sm font-extrabold uppercase mb-4 border-b border-[#35838D]/50 pb-3 text-[#0f4c5c]">
                Active Staff
              </h3>
              {doctors.length === 0 ? (
                <div className="text-center py-6 font-bold text-[#597e88] uppercase tracking-widest text-xs">
                  No doctors found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3 rounded-md border border-slate-200 group bg-white hover:shadow-lg transition duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e6f7f8] border border-[#35838D] rounded-md overflow-hidden shadow-inner">
                          {doc.image && (
                            <img
                              src={doc.image}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              alt={doc.name}
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold uppercase text-sm text-[#0f4c5c]">
                            {doc.name}
                          </h4>
                          <p className="text-xs font-extrabold text-[#e58221] uppercase mt-0.5">
                            {doc.specialization}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDoctor(doc._id, doc.name)}
                        className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 transition duration-200 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* SECTION 2: SERVICES */}
        {/* ========================================================== */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-base sm:text-lg md:text-xl font-black uppercase mb-4 sm:mb-5 flex items-center text-[#0f4c5c]">
            Hospital Services
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-md sm:rounded-lg border border-[#35838D]/50 shadow-lg shadow-teal-500/5 h-fit">
              <h3 className="text-sm font-extrabold uppercase mb-4 flex items-center border-b border-[#35838D]/50 pb-3 text-[#0f4c5c]">
                Add Service
              </h3>

              {serviceMsg && (
                <div className="mb-6 p-4 bg-[#e6f7f8] text-[#0f4c5c] border border-[#35838D] font-bold text-sm uppercase rounded-lg backdrop-blur-sm shadow-sm">
                  {serviceMsg}
                </div>
              )}

              <form onSubmit={handleAddService} className="flex flex-col gap-4">
                <div className="relative">
                  <Activity className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={serviceData.name}
                    onChange={(e) =>
                      setServiceData({ ...serviceData, name: e.target.value })
                    }
                    className="w-full pl-12 p-4 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <AlignLeft className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <textarea
                    placeholder="Short Description"
                    value={serviceData.description}
                    onChange={(e) =>
                      setServiceData({
                        ...serviceData,
                        description: e.target.value,
                      })
                    }
                    className="w-full pl-12 p-4 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none resize-none h-24 transition duration-200"
                    required
                  />
                </div>
                <div className="relative mt-2">
                  <label className="block text-xs font-black uppercase mb-2 text-[#597e88] tracking-wider">
                    Service Image
                  </label>
                  <input
                    id="servImageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setServiceImage(e.target.files?.[0] || null)
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm font-bold cursor-pointer text-[#597e88] file:border-0 file:bg-[#35838D] file:text-[#0f4c5c] file:px-4 file:py-2 file:rounded-md file:mr-3 hover:file:bg-[#71d2da] transition duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] text-white p-3 rounded-md font-black uppercase mt-2 text-sm shadow-lg hover:brightness-110 active:scale-98 transition duration-200"
                >
                  Publish Service
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-md sm:rounded-lg border border-[#35838D]/50 shadow-lg shadow-teal-500/5">
              <h3 className="text-sm font-extrabold uppercase mb-4 border-b border-[#35838D]/50 pb-3 text-[#0f4c5c]">
                Published Services
              </h3>
              {services.length === 0 ? (
                <div className="text-center py-10 font-bold text-[#597e88] uppercase tracking-widest">
                  No services found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((serv) => (
                    <div
                      key={serv._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 group bg-white hover:shadow-lg transition duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-14 h-14 bg-[#e6f7f8] border border-[#35838D] rounded-lg overflow-hidden shrink-0 shadow-inner">
                          {serv.image && (
                            <img
                              src={serv.image}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              alt={serv.name}
                            />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-extrabold uppercase text-sm text-[#0f4c5c] truncate">
                            {serv.name}
                          </h4>
                          <p className="text-xs font-bold text-[#597e88] truncate mt-1">
                            {serv.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveService(serv._id, serv.name)}
                        className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition duration-200 shrink-0 ml-4 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* SECTION 3: REVIEWS */}
        {/* ========================================================== */}
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-black uppercase mb-4 sm:mb-5 flex items-center text-[#0f4c5c]">
            Testimonial Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* ADD REVIEW FORM */}
            <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-md sm:rounded-lg border border-[#35838D]/50 shadow-lg shadow-teal-500/5 h-fit">
              <h3 className="text-sm font-extrabold uppercase mb-4 flex items-center border-b border-[#35838D]/50 pb-3 text-[#0f4c5c]">
                Add Review
              </h3>

              {reviewMsg && (
                <div className="mb-6 p-4 bg-[#e6f7f8] text-[#0f4c5c] border border-[#35838D] font-bold text-sm uppercase rounded-lg backdrop-blur-sm shadow-sm">
                  {reviewMsg}
                </div>
              )}

              <form onSubmit={handleAddReview} className="flex flex-col gap-4">
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <input
                    type="text"
                    placeholder="User Name"
                    value={reviewData.name}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, name: e.target.value })
                    }
                    className="w-full pl-12 p-4 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="relative mt-2">
                  <label className="block text-xs font-black uppercase mb-2 text-[#597e88] tracking-wider">
                    Client Image
                  </label>
                  <input
                    id="revImageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setReviewImage(e.target.files?.[0] || null)
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm font-bold cursor-pointer text-[#597e88] file:border-0 file:bg-[#35838D] file:text-[#0f4c5c] file:px-4 file:py-2 file:rounded-md file:mr-3 hover:file:bg-[#71d2da] transition duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 absolute left-4 top-4 text-[#597e88]" />
                  <textarea
                    placeholder="Review Content"
                    value={reviewData.review}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, review: e.target.value })
                    }
                    className="w-full pl-12 p-4 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 placeholder:text-[#597e88]/70 focus:border-[#35838D] focus:ring-4 focus:ring-[#35838D]/30 outline-none resize-none h-24 transition duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingReview}
                  className="w-full bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] text-white p-3 rounded-md font-black uppercase mt-2 text-sm shadow-lg hover:brightness-110 active:scale-98 transition duration-200 flex justify-center items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {loadingReview ? "Saving..." : "Add Review"}
                </button>
              </form>
            </div>

            {/* REVIEWS LIST */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-5 rounded-lg border border-[#35838D]/50 shadow-lg shadow-teal-500/5">
              <h3 className="text-sm font-extrabold uppercase mb-4 border-b border-[#35838D]/50 pb-3 text-[#0f4c5c]">
                Published Reviews
              </h3>
              {reviews.length === 0 ? (
                <div className="text-center py-10 font-bold text-[#597e88] uppercase tracking-widest">
                  No reviews found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((r) => (
                    <div
                      key={r._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 group bg-white hover:shadow-lg transition duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-14 h-14 bg-[#e6f7f8] border border-[#35838D] rounded-lg overflow-hidden shrink-0 shadow-inner">
                          <img
                            src={r.image}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            alt={r.name}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/150";
                            }}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-extrabold uppercase text-sm text-[#0f4c5c] truncate">
                            {r.name}
                          </h4>
                          <p className="text-xs font-bold text-slate-500 italic truncate mt-1 leading-relaxed">
                            "{r.review}"
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveReview(r._id)}
                        className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition duration-200 shrink-0 ml-4 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
    <Footer/>
    </div>
  );
}

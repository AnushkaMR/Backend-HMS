"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Activity, ArrowRight, Star } from "lucide-react";
import Navbar from "../navbar/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Footer from "../footer/Footer";

export default function LandingPage() {
  const router = useRouter();

  // States
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderImages = ["/slider1.png", "/slider2.png", "/slider3.png"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Doctors
        const resDocs = await fetch("http://localhost:5000/api/doctors");
        if (resDocs.ok) {
          const data = await resDocs.json();
          setDoctors(data.slice(0, 3));
        }

        // Fetch Services
        const resServs = await fetch("http://localhost:5000/api/services");
        if (resServs.ok) {
          const servData = await resServs.json();
          setServices(servData.slice(0, 3)); // Display first 3 services
        }

        // Fetch Reviews
        const resTestimonials = await fetch(
          "http://localhost:5000/api/reviews",
        );
        if (resTestimonials.ok) {
          const testData = await resTestimonials.json();
          setTestimonials(testData);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchData();
  }, []);

  // Helper to render stars based on rating number
  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating)
            ? "text-amber-400 fill-amber-400"
            : "text-slate-300"
        }`}
      />
    ));
  };

  const displayServices = services;

  // Helper function to resolve image URL
  const getImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return null;
    return imagePath;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col overflow-x-hidden">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section
        className="w-full relative  bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        <div className="relative flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-16 lg:px-24 py-10 md:py-16 gap-8 max-w-6xl mx-auto w-full">
          {/* TEXT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 text-center md:text-left z-10"
          >
            <motion.h1
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-black drop-shadow-sm"
            >
              Your Health,
              <span className="text-[#0f4c5c] relative left-2 sm:left-5 md:left-25">
                {" "}
                Our Priority.
              </span>
            </motion.h1>
            <p className="text-base sm:text-lg md:text-xl font-semibold mb-6 text-black drop-shadow-sm">
              Premium Healthcare At Your Fingertips
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const token =
                    typeof window !== "undefined"
                      ? localStorage.getItem("token")
                      : null;

                  if (!token) {
                    alert("Please log in to book an appointment.");
                    router.push("/login");
                  } else {
                    router.push("/patient/book");
                  }
                }}
                className="bg-[#0f4c5c] text-white px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-sm font-semibold hover:bg-[#1b263b] transition-all shadow-md cursor-pointer"
              >
                Appointments
              </button>
              <Link
                href="/doctors"
                className="bg-[#35838D] text-black px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-sm font-semibold hover:bg-[#215C63] transition-all shadow-md text-center"
              >
                Doctors
              </Link>
            </div>
          </motion.div>

          {/* IMAGE CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full max-w-xl relative h-[280px] sm:h-[350px] md:h-[400px] z-10"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              className="w-full h-full relative"
            >
              {/* <Image
                src="/hero.png"
                alt="Healthcare Hero"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                priority
              /> */}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. OUR SERVICES */}
      <section
        id="services"
        className="relative bg-gradient-to-br from-[#215C63]/20 via-transparent to-white py-16 px-6 md:px-16 lg:px-24 overflow-hidden border-y border-slate-200"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 max-w-5xl mx-auto">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
              Clinical Expertise
            </h2>
            <p className="text-[#597e88] font-bold tracking-wider text-[10px] uppercase mt-1">
              Advanced medical services
            </p>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-2 bg-[#0f4c5c] text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#1b263b] transition duration-300 shadow-md"
          >
            More <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayServices.map((service) => (
            <div
              key={service._id}
              className="group flex flex-col h-[380px] cursor-pointer border border-white/40 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-lg overflow-hidden hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all duration-500"
            >
              {/* Image Block */}
              <div className="h-[45%] relative overflow-hidden bg-[#e6f7f8]">
                {service.image ? (
                  getImageUrl(service.image)?.startsWith(
                    "http://localhost:5000",
                  ) ? (
                    <img
                      src={getImageUrl(service.image)!}
                      alt={service.name}
                      className="object-cover group-hover:scale-105 transition-all duration-700 w-full h-full"
                    />
                  ) : (
                    <Image
                      src={getImageUrl(service.image)!}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-all duration-700"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#0f4c5c]">
                    <Activity size={50} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              </div>

              {/* Text Block */}
              <div className="h-[55%] p-4 sm:p-5 flex flex-col justify-between bg-white/70 backdrop-blur-lg flex-1">
                <div>
                  <h3 className="text-lg font-black uppercase mb-1.5 text-slate-900 leading-tight tracking-tight line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="font-medium text-slate-600 text-xs line-clamp-3 mb-3">
                    {service.description}
                  </p>
                </div>

                <Link
                  href="/services"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SCHEDULE SECTION */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 md:px-16 lg:px-24 overflow-hidden bg-gradient-to-tr from-[#35838D]/20 to-transparent border-b border-slate-200">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#215C63]/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#597e88]/10 rounded-full blur-2xl -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 z-10 max-w-lg"
          >
            <span className="text-[#597e88] font-black uppercase tracking-widest text-[10px] mb-2.5 block">
              Book Fast & Secure
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-5 sm:mb-6 text-slate-900">
              Schedule Your Visit <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f4c5c] to-[#597e88]">
                in Seconds.
              </span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md">
              Skip the long queues. Choose your specialty, find a time that
              works best, and securely book with qualified professionals in just
              a few clicks.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/patient/book"
                className="inline-flex items-center bg-slate-900 text-white px-5 py-2.5 text-sm sm:text-base font-bold gap-2 shadow-lg hover:bg-slate-800 active:scale-98 transition duration-300 rounded-lg"
              >
                Appointments <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center bg-white border border-slate-200 text-slate-800 px-5 py-2.5 text-sm sm:text-base font-bold shadow-sm hover:bg-slate-50 transition duration-300 rounded-lg"
              >
                Our Services
              </Link>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="flex-1 w-full max-w-md md:max-w-lg z-10"
          >
            <div className="relative bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-lg p-8 flex flex-col items-center">
              <div className="w-full h-[320px] md:h-[360px] relative rounded-lg overflow-hidden shadow-inner mb-6">
                <Image
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop"
                  alt="Doctor Schedule Consultation"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex justify-between w-full items-center px-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-900 text-sm">
                    4.9/5 Trust Rating
                  </span>
                </div>
                <span className="text-xs uppercase tracking-widest text-[#597e88] font-bold bg-[#215C63]/30 px-3 py-1 rounded-full">
                  Available
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. OUR DOCTORS */}
      <section className="bg-slate-50/50 py-16 px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 max-w-5xl mx-auto gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
              Our Doctors
            </h2>
            <p className="text-[#597e88] font-bold tracking-wider text-[10px] uppercase mt-1">
              Meet our team of experts
            </p>
          </div>
          <Link
            href="/doctors"
            className="flex items-center gap-1.5 bg-[#0f4c5c] text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#1b263b] transition duration-300 shadow-md"
          >
            More <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {doctors.length > 0
            ? doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="group flex flex-col h-[380px] cursor-pointer border border-white/40 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-lg overflow-hidden hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all duration-500"
                >
                  {/* Image Block */}
                  <div className="h-[55%] relative overflow-hidden bg-[#e6f7f8]">
                    {doc.image ? (
                      getImageUrl(doc.image)?.startsWith(
                        "http://localhost:5000",
                      ) ? (
                        <img
                          src={getImageUrl(doc.image)!}
                          alt={doc.name}
                          className="object-contain p-2 group-hover:scale-105 transition-all duration-700 w-full h-full"
                        />
                      ) : (
                        <Image
                          src={getImageUrl(doc.image)!}
                          alt={doc.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-2 group-hover:scale-105 transition-all duration-700"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#0f4c5c]">
                        <User size={50} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm rounded-full z-10">
                      Specialist
                    </span>
                  </div>

                  {/* Text Block */}
                  <div className="h-[45%] p-4 sm:p-5 flex flex-col justify-between bg-white/70 backdrop-blur-lg flex-1 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-[#597e88] uppercase tracking-widest mb-1 block">
                        {doc.specialization || "Physician"}
                      </span>
                      <h3 className="text-lg font-black uppercase mb-1.5 text-slate-900 leading-tight tracking-tight line-clamp-1">
                        {doc.name || "Doctor"}
                      </h3>
                    </div>

                    <Link
                      href={`/doctors/${doc._id}`}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5"
                    >
                      View Profile <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            : [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur-lg border border-white/60 flex flex-col rounded-lg shadow-sm h-[380px] animate-pulse"
                >
                  <div className="h-[55%] bg-slate-200/60 rounded-t-lg" />
                  <div className="h-[45%] p-5 flex flex-col justify-between">
                    <div>
                      <div className="h-2 w-16 bg-slate-200 rounded mx-auto mb-3" />
                      <div className="h-4 w-32 bg-slate-200 rounded mx-auto" />
                    </div>
                    <div className="h-9 w-full bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* 4.5 IMAGE SLIDER */}
      <section className="w-full relative h-[300px] md:h-[550px] bg-center bg-cover group bg-slate-900">
        <div className="w-full h-full relative">
          {sliderImages.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentSlide === idx ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: currentSlide === idx ? "auto" : "none" }}
            >
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 relative">
                {/* Fallback styling for when images are missing so it still looks decent */}
                <Image
                  src={img}
                  alt="Health is life priority"
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  onError={(e) => {
                    // Hide broken image icon if image doesn't exist
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40" />
              </div>
            </motion.div>
          ))}

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-widest text-center drop-shadow-xl">
              Health is <span className="text-[#35838D]">Life Priority</span>
            </h2>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10">
            {sliderImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                  currentSlide === idx
                    ? "bg-[#35838D] scale-125"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. VOICES OF TRUST */}
      <section className="bg-gradient-to-br from-[#35838D]/10 via-slate-50/50 to-white py-16 px-6 md:px-16 lg:px-24 overflow-hidden">
        <div className="text-center mb-14 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold inline-block border-b-4 border-slate-900 pb-2">
            Voices of Trust
          </h2>
          <p className="text-[#597e88] font-bold tracking-wider text-[10px] uppercase mt-2">
            Updated directly by the admin
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {loadingTestimonials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur-md rounded-lg p-6 border border-white/60 animate-pulse flex flex-col items-center h-[320px]"
                />
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: index * 0.4,
                  }}
                  className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(8,112,184,0.1)] h-full"
                >
                  {/* Avatar - Top Center */}
                  <div className="w-16 h-16 bg-white shadow-sm shrink-0 overflow-hidden flex items-center justify-center relative rounded-full border-4 border-white mb-5">
                    {getImageUrl(testimonial.image)?.startsWith(
                      "http://localhost:5000",
                    ) ? (
                      <img
                        src={getImageUrl(testimonial.image)!}
                        alt={testimonial.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image
                        src={getImageUrl(testimonial.image)!}
                        alt={testimonial.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-base text-slate-700 italic leading-relaxed text-center mb-6 flex-grow">
                    &ldquo;{testimonial.review}&rdquo;
                  </p>

                  {/* Name & Role */}
                  <div className="text-center mb-4">
                    <h4 className="font-extrabold text-xl text-slate-950 tracking-tight">
                      {testimonial.name}
                    </h4>
                    <span className="text-xs font-semibold tracking-wide text-[#597e88] mt-0.5 block">
                      {testimonial.role || "Patient"}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mt-auto">
                    {renderStars(testimonial.rating)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white/50 border border-slate-200 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
              <p className="text-slate-500 font-semibold text-lg">
                No testimonials have been added by the admin yet.
              </p>
            </div>
          )}
        </div>

        {/* Optional decorative background blobs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#35838D]/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10" />
      </section>
      <Footer />
    </div>
  );
}

import Link from "next/link";

function Footer() {
  return (
    <div className="bg-white px-6 md:px-16 lg:px-24 py-8 border-t border-slate-100 flex flex-col items-center">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
        {/* LOGO (Left) */}
        <div className="md:w-1/4 text-2xl font-black tracking-tighter text-slate-900 text-center md:text-left">
          LOGO
        </div>

        {/* MENU (Center) */}
        <div className="md:w-2/4 flex justify-center items-center text-sm md:text-base font-bold gap-4 md:gap-8">
          <Link
            href="/"
            className="hover:text-sky-500 transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          <Link
            href="/doctors"
            className="hover:text-sky-500 transition-colors whitespace-nowrap"
          >
            Doctors
          </Link>
          <Link
            href="/patient/book"
            className="hover:text-sky-500 transition-colors whitespace-nowrap"
          >
            Appointments
          </Link>
          <Link
            href="#services"
            className="hover:text-sky-500 transition-colors whitespace-nowrap"
          >
            Services
          </Link>
        </div>

        {/* Empty right side to balance */}
        <div className="md:w-1/4 hidden md:block"></div>
      </div>

      {/* Copyright */}
      <div className="text-xs font-semibold text-slate-400 text-center border-t border-slate-100 pt-6 w-full max-w-5xl">
        &copy; {new Date().getFullYear()} AMR deverloper. All rights reserved.
      </div>
    </div>
  );
}

export default Footer;

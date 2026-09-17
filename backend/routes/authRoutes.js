import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import upload from "../middleware/upload.js";
import Appointment from "../models/appointment.js";
import Service from "../models/service.js";
import Review from "../models/Review.js";
import Testimonial from "../models/Testimonial.js";
import { OAuth2Client } from "google-auth-library";
const router = express.Router();

// 1. ADMIN MIDDLEWARE (The Admin Bouncer)
const isAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Admins only." });
    }
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// 2. GENERAL AUTH MIDDLEWARE (The General Bouncer)
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access Denied. Please log in." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; 
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// PATIENT REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ message: "Patient registered successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    res.status(500).json(error);
  }
});

// GOOGLE LOGIN/REGISTER
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // User doesn't exist, register them as patient
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = new User({ 
        email, 
        password: hashedPassword, 
        role: "patient",
        name,
        image: picture
      });
      await user.save();
    }

    // Now log them in (generate token)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Google Login successful", token, role: user.role });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
});
// ADMIN: CREATE DOCTOR
router.post("/create-doctor", isAdmin, upload.single("image"), async (req, res) => {
  const { email, password, name, specialization, rating } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const imagePath = req.file ? req.file.path : "";

    const doctor = new User({
      email, password: hashedPassword, role: "doctor", name, specialization, image: imagePath, rating
    });

    await doctor.save();
    res.json({ message: "Doctor created successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// ADMIN: CREATE SERVICES
router.post("/services", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "An image file is required." });
    }

    const imagePath = req.file.path;

    const newService = new Service({
      name,
      description,
      image: imagePath,
    });

    await newService.save();

    res.status(201).json({ message: "Service added successfully!" });
  } catch (error) {
    console.error("🔥 CRASH REASON:", error); 
    res.status(500).json({ message: "Server error while adding service." });
  }
});

// ADMIN: REMOVE SERVICE
router.delete("/services/:id", isAdmin, async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting service", error });
  }
});

// GET all testimonials (Public Route)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new testimonial (Admin Route)
router.post('/', async (req, res) => {
  const testimonial = new Testimonial({
    name: req.body.name,
    text: req.body.text,
    image: req.body.image,
  });

  try {
    const newTestimonial = await testimonial.save();
    res.status(201).json(newTestimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// ==========================================================
// 🔴 PUBLIC ROUTES: REVIEWS
// ==========================================================

// EVERYONE: GET ALL REVIEWS
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});

// ADMIN: CREATE A REVIEW
router.post("/reviews", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, review } = req.body;

    if (!name || !review || !req.file) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const imagePath = req.file.path;

    const newReview = new Review({
      name,
      review,
      image: imagePath,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error });
  }
});

// ADMIN: REMOVE A REVIEW
router.delete("/reviews/:id", isAdmin, async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
});

// DOCTOR: SET AVAILABILITY
router.post("/doctor/availability", authenticateToken, async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).json({ message: "Doctors only" });
  try {
    await User.findByIdAndUpdate(req.user.id, { availability: req.body.availability });
    res.json({ message: "Availability updated successfully!" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// ==========================================================
// 🔴 PUBLIC ROUTES
// ==========================================================

// EVERYONE: GET ALL DOCTORS
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("name specialization image rating availability");
    res.json(doctors);
  } catch (error) {
    res.status(500).json(error);
  }
});

// EVERYONE: GET A SINGLE DOCTOR BY ID
router.get("/doctors/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select("-password");
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor details", error });
  }
});

// EVERYONE: GET ALL SERVICES 
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error });
  }
});

// ==========================================================
// SECURE ROUTES (Require Login Required )
// ==========================================================

// EVERYONE: GET APPOINTMENT COUNTS FOR A DATE (To check availability)
router.get("/appointments/check-availability", async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ message: "Doctor ID and date are required" });
  
  try {
    const appointments = await Appointment.find({ doctorId, date });
    
    // Count appointments per time slot
    const slotCounts = {};
    appointments.forEach(appt => {
      slotCounts[appt.time] = (slotCounts[appt.time] || 0) + 1;
    });

    // Determine fully booked slots (>= 4)
    const fullyBookedSlots = Object.keys(slotCounts).filter(time => slotCounts[time] >= 4);

    res.json({ fullyBookedSlots });
  } catch (error) {
    res.status(500).json({ message: "Error checking availability", error });
  }
});

// PATIENT: BOOK AN APPOINTMENT
router.post("/appointments/book", authenticateToken, async (req, res) => {
  if (req.user.role !== "patient") return res.status(403).json({ message: "Only patients can book appointments." });
  const { doctorId, date, time, patientName, phone, reasonForVisit } = req.body;

  try {
    // 1. Check if THIS patient already booked this exact slot
    const alreadyBooked = await Appointment.findOne({
      patientId: req.user.id,
      doctorId,
      date,
      time,
    });
    if (alreadyBooked) {
      return res.status(400).json({ message: "You have already booked this time slot. Please choose another." });
    }

    // 2. Check if the slot has reached the 4-appointment limit
    const appointmentCount = await Appointment.countDocuments({ doctorId, date, time });
    if (appointmentCount >= 4) {
      return res.status(400).json({ message: "This time slot is fully booked (4/4). Please choose another." });
    }

    const newAppointment = new Appointment({
      patientId: req.user.id, doctorId, date, time, patientName, phone, reasonForVisit
    });
    await newAppointment.save();
    res.json({ message: "Appointment booked successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving appointment to database.", error });
  }
});

// EVERYONE: GET MY APPOINTMENTS
router.get("/appointments/my-appointments", authenticateToken, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === "doctor") {
      appointments = await Appointment.find({ doctorId: req.user.id }).populate("patientId", "email");
    } else if (req.user.role === "patient") {
      appointments = await Appointment.find({ patientId: req.user.id }).populate("doctorId", "name specialization");
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error });
  }
});

// DOCTOR: GET OWN PROFILE
router.get("/doctor/profile", authenticateToken, async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select("-password");
    res.json(doctor);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ADMIN: REMOVE DOCTOR
router.delete("/doctor/:id", isAdmin, async (req, res) => {
  try {
    const deletedDoctor = await User.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting doctor", error });
  }
});

// PATIENT/DOCTOR: CANCEL AN APPOINTMENT (with ownership check)
router.delete("/appointments/:id", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Only the patient who booked it OR the assigned doctor can cancel
    const isOwner =
      appointment.patientId.toString() === req.user.id ||
      appointment.doctorId.toString() === req.user.id;

    if (!isOwner) {
      return res.status(403).json({ message: "You are not authorized to cancel this appointment." });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling appointment", error });
  }
});

export default router;
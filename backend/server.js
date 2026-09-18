import express, { json } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/user.js";
import Appointment from "./models/appointment.js";
import bcrypt from "bcryptjs";
import cron from "node-cron";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);

// Root route for server status
app.get("/", (req, res) => {
  res.json({ message: "Backend is running", env: process.env.NODE_ENV || "production" });
});

const PORT = process.env.PORT || 5000;

// --- APPOINTMENT REMINDER CRON JOB ---
// Runs every day at 9:00 AM to log reminders for tomorrow's appointments
// To enable real SMS, replace logReminder() with your SMS provider (e.g. Twilio, Vonage)
const setupAppointmentReminders = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running daily appointment reminder check...");

    try {
      // Calculate tomorrow's date in YYYY-MM-DD format
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0]; // e.g., "2026-06-27"

      // Find all appointments for tomorrow
      const tomorrowAppointments = await Appointment.find({ date: tomorrowStr })
        .populate("doctorId", "name specialization");

      if (tomorrowAppointments.length === 0) {
        console.log("📅 No appointments found for tomorrow.");
        return;
      }

      console.log(`📅 Found ${tomorrowAppointments.length} appointment(s) for tomorrow (${tomorrowStr}).`);

      // Log reminder for each patient (replace with real SMS provider when ready)
      for (const appt of tomorrowAppointments) {
        if (appt.phone) {
          const doctorName = appt.doctorId?.name || "your doctor";
          const message = `🏥 SmartCare Reminder: Hi ${appt.patientName}, you have an appointment with Dr. ${doctorName} tomorrow (${appt.date}) at ${appt.time}. Please arrive 10 minutes early.`;
          console.log(`📱 REMINDER → To: ${appt.phone} | Message: ${message}`);
        } else {
          console.log(`⚠️ No phone number for patient: ${appt.patientName}, skipping reminder.`);
        }
      }

      console.log("✅ Appointment reminders processed successfully.");
    } catch (error) {
      console.error("❌ Error running appointment reminders:", error);
    }
  });

  console.log("📱 Appointment reminder cron job scheduled (daily at 9:00 AM).");
};

const createPermanentAdmin = async () => {
  try {
    // 1. Grab the credentials from the .env file
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 2. Check if an admin with this email already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      // 3. Hash the password securely
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // 4. Create and save the new admin
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: "admin", // Explicitly setting the admin role
      });

      await adminUser.save();
      console.log("✅ Permanent Admin account created successfully!");
    } else {
      // If an admin already exists, just log this and move on
      console.log("⚡ Admin account already exists. Skipping creation.");
    }
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
  }
};

const startServer = async () => {
  console.log("Starting server and connecting to MongoDB...");
  await connectDB();
  await createPermanentAdmin();

  // Always listen on a port — required for Azure App Service and local dev.
  // Vercel does NOT use app.listen(); it imports the exported `app` directly.
  // WEBSITE_SITE_NAME is an env var set automatically by Azure App Service.
  const isVercel = process.env.VERCEL === "1";
  if (!isVercel) {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
    setupAppointmentReminders();
  }
};

startServer();

// Export the app so Vercel can use it as a serverless function
export default app;
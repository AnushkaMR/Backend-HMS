import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  // Who is booking it? (Links to the Patient's account)
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Who are they seeing? (Links to the Doctor's account)
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Appointment Details
  date: { type: String, required: true }, 
  time: { type: String, required: true }, 
  patientName: { type: String, required: true },
  phone: { type: String }, // Added this because your frontend form asks for a phone number!
  reasonForVisit: { type: String },
  status: { type: String, default: "Confirmed" }
}, { timestamps: true });

export default mongoose.model("Appointment", AppointmentSchema);
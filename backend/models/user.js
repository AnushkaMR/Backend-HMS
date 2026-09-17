import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "doctor", "patient"],
    default: "patient"
   },

  name: {
    type: String,
  },
  specialization: {
    type: String,
  },
  image:{
    type: String,
  },
  rating: {
    type: Number,
    default: 0
  },
  availability: [
    {
      day: { type: String },
      times: [{ type: String }] 
    }
  ]
});

export default mongoose.model("User", UserSchema);

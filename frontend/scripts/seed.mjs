import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Simple User Schema for the script (to avoid importing the TS model which might cause issues in JS script)
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    specialization: String,
    availability: [String],
    image: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to database');

        const adminEmail = 'admin@smartcare.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdmin = new User({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            });
            await newAdmin.save();
            console.log('Admin user created successfully');
            console.log('Email: admin@smartcare.com');
            console.log('Password: admin123');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();

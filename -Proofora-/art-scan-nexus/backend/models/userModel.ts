// backend/models/userModel.ts
import mongoose from 'mongoose';

// Define the user schema with Full Name, Email, and Password
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
});

export const User = mongoose.model('User', userSchema);

export default User;
// backend/controllers/authController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/userModel.ts';
import Auth from '../utils/auth.ts'


// User registration
export const registerUser = async (req: Request, res: Response) => {
  console.log('register payload:', req.body);
  const { fullName, email, password } = req.body;

  
  try {
    const existing = await User.findOne({ email });
    if (!existing) {
      return res.status(403).json({ message: 'Registration allowed only for pre-approved users' });
    }

   
    if (!(existing as any).password) {
      (existing as any).fullName = fullName || (existing as any).fullName;
      (existing as any).password = password;
      if (!(existing as any).token) {
        (existing as any).token = Auth.generateToken(existing._id.toString());
      }
      await existing.save();
      return res.status(201).json({ message: 'User registered successfully', token: (existing as any).token });
    }

    return res.status(400).json({ message: 'User already registered' });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error registering user', error: error?.message || error });
  }
};

// User login
export const loginUser = async (req: Request, res: Response) => {
  console.log('[Login] Received login request');
  
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('[Login] MongoDB not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please check if MongoDB is connected.',
        error: 'Database not connected'
      });
    }

    console.log('[Login] Request body:', { email: req.body?.email, password: '***' });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[Login] Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('[Login] Looking up user:', email);
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[Login] User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('[Login] User found, checking password');
    // Check if the entered password matches the stored password (plain text)
    if ((user as any).password !== password) {
      console.log('[Login] Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('[Login] Password correct, generating token');
    // Use stored token if available, otherwise generate new one
    let token: string;
    if ((user as any).token) {
      console.log('[Login] Using existing token');
      token = (user as any).token;
    } else {
      console.log('[Login] Generating new token');
      token = Auth.generateToken(user._id.toString());
      (user as any).token = token;
      await user.save();
    }
    
    console.log('[Login] Sending success response');
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error: any) {
    console.error('[Login] Error caught:', error);
    console.error('[Login] Error stack:', error?.stack);
    console.error('[Login] Headers sent?', res.headersSent);
    
    // Ensure we always send a JSON response
    if (!res.headersSent) {
      // Explicitly set content-type header
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ 
        message: 'Error during login', 
        error: error?.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      console.error('[Login] Headers already sent, cannot send error response');
    }
  }
};
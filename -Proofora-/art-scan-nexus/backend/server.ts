

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config.ts';
import authRoutes from './routes/authRoutes.ts'
import { User } from './models/userModel.ts'
import Auth from './utils/auth.ts'
import uploadRoutes from "./routes/uploadRoutes.ts";
import designRoutes from "./routes/designRoutes.ts";


dotenv.config(); 

const app = express();
// Use port 5001 (5000 is used by macOS ControlCenter)
const port = process.env.PORT || 5001;

// Middleware setup - order matters!
app.use(cors({ origin: ['http://localhost:8081','http://127.0.0.1:8081','http://localhost:8082'] }));

// JSON parser with error handling
app.use(express.json({
  strict: true,
  type: 'application/json'
}));

// Handle JSON parsing errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  next(err);
});

// Set default Content-Type for JSON responses
app.use((req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to always set content-type
  res.json = function(body: any) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson(body);
  };
  
  next();
});

// Debug: Log all requests with more details
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes - all routes registered after express.json()
app.use('/api/auth', authRoutes);  // Authentication routes (Login/Signup)
app.use("/api/upload", uploadRoutes);
app.use("/api/designs", designRoutes);
console.log('Routes registered: /api/auth -> authRoutes');

// 404 handler - must be before error handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler middleware - must be after all routes and 404 handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Ensure response hasn't been sent yet
  if (res.headersSent) {
    return next(err);
  }
  
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  
  // Always send JSON response with proper content-type
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
});


const start = async () => {
  try {
    console.log('🚀 Starting server...');
    console.log(`📌 Port: ${port}`);
    
    // Start server first, then handle DB connection
    const server = app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`✅ Server is ready to accept requests`);
      console.log(`✅ Health check: http://localhost:${port}/api/auth/_debug/health`);
    });

    // Handle server errors on the server instance
    server.on('error', (error: any) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Please stop the other process or use a different port.`);
        process.exit(1);
      }
    });

    // Now try to connect to MongoDB (non-blocking)
    const dbConnected = await connectDB();

    // Only seed users if database is connected
    if (dbConnected) {
      try {
        // Seed users with JWT tokens if they do not exist
        const seedUsers = [
          { fullName: 'Bhavya Aggarwal', email: 'bhavya@gmail.com', password: 'password123' },
          { fullName: 'Rijul Rangta', email: 'rijul@gmail.com', password: 'password1234' },
          { fullName: 'Vanni Chauhan', email: 'vanni@gmail.com', password: 'password1235' },
        ];

        for (const su of seedUsers) {
          try {
            const existing = await User.findOne({ email: su.email });
            if (!existing) {
              const doc = new User(su);
              await doc.save();
              // Generate token after saving to get the _id
              const token = Auth.generateToken(doc._id.toString());
              (doc as any).token = token;
              await doc.save();
              console.log(`Seeded user: ${su.email} with token`);
            } else {
              console.log(`User ${su.email} already exists`);
            }
          } catch (seedError: any) {
            console.error(`Error seeding user ${su.email}:`, seedError.message);
          }
        }
      } catch (error: any) {
        console.error('Error during user seeding:', error.message);
      }
    } else {
      console.warn('⚠️  Skipping user seeding - MongoDB not connected');
      console.warn('⚠️  WARNING: MongoDB is not connected. API endpoints will return errors.');
    }

    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  WARNING: JWT_SECRET is not set. Token generation will fail.');
    }

  } catch (error: any) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
};

start().catch((error) => {
  console.error('❌ Unhandled error in start function:', error);
  process.exit(1);
});
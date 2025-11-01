// backend/utils/auth.ts
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;  // Get JWT secret key from environment variable

if (!secretKey) {
  console.error('WARNING: JWT_SECRET environment variable is not set!');
}

// Generate JWT token
export const generateToken = (userId: string) => {
  if (!secretKey) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
};

// Middleware to authenticate JWT token
export const authenticate = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Extract token from header

  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!secretKey) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' });
  }

  try {
    const decoded: any = jwt.verify(token, secretKey);
    req.user = decoded;  // Attach decoded user info to the request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default { generateToken, authenticate };
// backend/routes/authRoutes.ts
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.ts';
import { User } from '../models/userModel.ts';

const router = express.Router();

// Async error wrapper to catch errors and pass to Express error handler
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST route to register a new user
router.post('/register', asyncHandler(registerUser));

// POST route to log in an existing user
router.post('/login', asyncHandler(loginUser));

// Debug endpoints
router.get('/_debug/health', (req, res) => {
  res.json({ ok: true });
});

router.get('/_debug/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments({});
    res.json({ count });
  } catch (e: any) {
    res.status(500).json({ message: 'Count failed', error: e?.message || e });
  }
});

export default router;
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET environment variable is required');
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, firstName, lastName, phone, role = 'patient' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const user = new User({
      email,
      password,
      name,
      firstName: firstName || name.split(' ')[0],
      lastName: lastName || name.split(' ').slice(1).join(' '),
      phone,
      role,
      provider: 'local',
      isVerified: true,
    });

    const refreshToken = generateRefreshToken();
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshExpiry,
      userAgent: req.headers['user-agent'] || 'unknown',
    });
    user.lastLogin = new Date();

    await user.save();

    const accessToken = generateAccessToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.status(201).json({
      message: 'Account created successfully',
      token: accessToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({
        error: 'This account uses Google Sign-In. Please sign in with Google.',
        provider: 'google',
      });
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Clean expired refresh tokens
    user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());

    const refreshToken = generateRefreshToken();
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshExpiry,
      userAgent: req.headers['user-agent'] || 'unknown',
    });
    user.lastLogin = new Date();

    // Keep max 5 refresh tokens per user
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    const accessToken = generateAccessToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({
      message: 'Login successful',
      token: accessToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Remove old token and issue new pair
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);

    const newRefreshToken = generateRefreshToken();
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: refreshExpiry,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    await user.save();

    const accessToken = generateAccessToken(user);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({ token: accessToken, user: user.toSafeObject() });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await User.updateOne(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Verify token
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true, user: user.toSafeObject() });
  } catch {
    res.status(401).json({ valid: false });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const allowedFields = ['name', 'firstName', 'lastName', 'phone', 'avatar', 'coverImage', 'preferences', 'onboardingCompleted'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({ error: 'Google accounts cannot change password here' });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed' });
  }
});

module.exports = router;

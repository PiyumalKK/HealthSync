const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// Google Sign-In with ID token (from frontend @react-oauth/google)
router.post('/callback', async (req, res) => {
  try {
    const { credential, clientId } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID || clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr.message);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture, given_name, family_name, email_verified } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google account' });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }]
    });

    let isNewUser = false;

    if (!user) {
      // Create new user from Google
      isNewUser = true;
      user = new User({
        email: email.toLowerCase(),
        name: name || `${given_name || ''} ${family_name || ''}`.trim(),
        firstName: given_name || name?.split(' ')[0] || '',
        lastName: family_name || name?.split(' ').slice(1).join(' ') || '',
        avatar: picture,
        provider: 'google',
        googleId,
        isVerified: email_verified || true,
        role: 'patient',
      });
    } else {
      // Update existing user with latest Google info
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      if (user.provider === 'local') user.provider = 'google';
      user.isVerified = true;
    }

    // Clean expired refresh tokens
    user.refreshTokens = (user.refreshTokens || []).filter(t => t.expiresAt > new Date());

    // Issue new refresh token
    const refreshToken = generateRefreshToken();
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshExpiry,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    user.lastLogin = new Date();
    await user.save();

    // Generate access token
    const accessToken = generateAccessToken(user);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({
      message: isNewUser ? 'Account created with Google' : 'Signed in with Google',
      token: accessToken,
      user: user.toSafeObject(),
      isNewUser,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// Get Google client ID for frontend
router.get('/client-id', (req, res) => {
  res.json({
    clientId: GOOGLE_CLIENT_ID,
    enabled: !!GOOGLE_CLIENT_ID,
  });
});

module.exports = router;

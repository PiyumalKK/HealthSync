const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user preferences
router.patch('/preferences', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: { ...req.body } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete account (soft delete)
router.delete('/me', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false, refreshTokens: [] },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Account deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

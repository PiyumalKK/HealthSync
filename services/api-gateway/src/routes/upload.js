const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_COVER_SIZE = 10 * 1024 * 1024; // 10MB for covers
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Multer configs
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
  },
});

const coverUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_COVER_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
  },
});

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';

function getContainerClient() {
  if (!AZURE_STORAGE_CONNECTION_STRING) return null;
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  return blobServiceClient.getContainerClient(CONTAINER_NAME);
}

// Sync image to Doctor record in PostgreSQL via doctor-service
async function syncDoctorImage(userId, field, url) {
  try {
    const res = await fetch(`${DOCTOR_SERVICE_URL}/api/me/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId, 'x-user-role': 'doctor' },
      body: JSON.stringify({ [field]: url }),
    });
    if (!res.ok) console.error(`Doctor sync failed (${res.status}):`, await res.text());
  } catch (err) {
    console.error('Doctor image sync error:', err.message);
  }
}

async function uploadBlob(containerClient, prefix, userId, file) {
  const ext = file.originalname.split('.').pop().toLowerCase();
  const blobName = `${prefix}/${userId}-${Date.now()}.${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
      blobCacheControl: 'public, max-age=86400',
    },
  });
  return blockBlobClient.url;
}

async function deleteOldBlob(containerClient, url, folder) {
  if (url && url.includes(`sthealthsyncweb.blob.core.windows.net/avatars/${folder}/`)) {
    try {
      const blobName = url.split('/avatars/')[1];
      if (blobName) await containerClient.getBlockBlobClient(blobName).deleteIfExists();
    } catch { /* ignore */ }
  }
}

// ─── Patient/User Avatar ───
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const containerClient = getContainerClient();
    if (!containerClient) return res.status(503).json({ error: 'Storage service not configured' });

    const user = await User.findById(req.user.id);
    await deleteOldBlob(containerClient, user?.avatar, 'users');
    const avatarUrl = await uploadBlob(containerClient, 'users', req.user.id, req.file);

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true });

    // If user is a doctor, also sync to Doctor record in PostgreSQL
    if (req.user.role === 'doctor') {
      await syncDoctorImage(req.user.id, 'profileImage', avatarUrl);
    }

    res.json({ avatar: avatarUrl, user: updatedUser.toSafeObject() });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// ─── Patient/User Cover Image ───
router.post('/cover', authMiddleware, coverUpload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const containerClient = getContainerClient();
    if (!containerClient) return res.status(503).json({ error: 'Storage service not configured' });

    const user = await User.findById(req.user.id);
    await deleteOldBlob(containerClient, user?.coverImage, 'covers');
    const coverUrl = await uploadBlob(containerClient, 'covers', req.user.id, req.file);

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { coverImage: coverUrl }, { new: true });

    // If user is a doctor, also sync to Doctor record in PostgreSQL
    if (req.user.role === 'doctor') {
      await syncDoctorImage(req.user.id, 'coverImage', coverUrl);
    }

    res.json({ coverImage: coverUrl, user: updatedUser.toSafeObject() });
  } catch (err) {
    console.error('Cover upload error:', err);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// ─── Doctor Profile Image (DP) ───
router.post('/doctor/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Only doctors can upload doctor profile images' });
    const containerClient = getContainerClient();
    if (!containerClient) return res.status(503).json({ error: 'Storage service not configured' });

    const imageUrl = await uploadBlob(containerClient, 'doctors', req.user.id, req.file);

    // Also update the user avatar in MongoDB
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { avatar: imageUrl }, { new: true });

    // Sync to Doctor record in PostgreSQL
    await syncDoctorImage(req.user.id, 'profileImage', imageUrl);

    res.json({ profileImage: imageUrl, user: updatedUser.toSafeObject() });
  } catch (err) {
    console.error('Doctor avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// ─── Doctor Cover Image ───
router.post('/doctor/cover', authMiddleware, coverUpload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Only doctors can upload doctor cover images' });
    const containerClient = getContainerClient();
    if (!containerClient) return res.status(503).json({ error: 'Storage service not configured' });

    const coverUrl = await uploadBlob(containerClient, 'doctor-covers', req.user.id, req.file);

    // Also update the user coverImage in MongoDB
    await User.findByIdAndUpdate(req.user.id, { coverImage: coverUrl });

    // Sync to Doctor record in PostgreSQL
    await syncDoctorImage(req.user.id, 'coverImage', coverUrl);

    res.json({ coverImage: coverUrl });
  } catch (err) {
    console.error('Doctor cover upload error:', err);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// Multer error handling
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Doctor, AvailabilitySlot } = require('../models');
const { getCache, setCache, invalidateCache } = require('../cache');
const { Op } = require('sequelize');

// Get all doctors (with caching)
router.get('/', async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    const cacheKey = `doctors:${specialization || 'all'}:${search || ''}:${page}:${limit}`;
    
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const where = { isActive: true };
    if (specialization) where.specialization = specialization;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { specialization: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Doctor.findAndCountAll({
      where,
      include: [{ model: AvailabilitySlot, as: 'slots', where: { isActive: true }, required: false }],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['rating', 'DESC']]
    });

    const result = { doctors: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) };
    await setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public route - get doctors list (no auth)
router.get('/public', async (req, res) => {
  try {
    const { specialization, page = 1, limit = 12 } = req.query;
    const where = { isActive: true, isAvailable: true };
    if (specialization) where.specialization = specialization;

    const { count, rows } = await Doctor.findAndCountAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'specialization', 'qualification', 'experience', 'consultationFee', 'profileImage', 'rating', 'totalReviews', 'bio'],
      include: [{ model: AvailabilitySlot, as: 'slots', where: { isActive: true }, required: false }],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['rating', 'DESC']]
    });

    res.json({ doctors: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specializations
router.get('/specializations', async (req, res) => {
  try {
    const cached = await getCache('specializations');
    if (cached) return res.json(cached);

    const specs = await Doctor.findAll({
      attributes: ['specialization'],
      group: ['specialization'],
      where: { isActive: true }
    });
    const result = specs.map(s => s.specialization);
    await setCache('specializations', result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get featured doctors (top rated, public)
router.get('/featured', async (req, res) => {
  try {
    const cached = await getCache('featured-doctors');
    if (cached) return res.json(cached);

    const doctors = await Doctor.findAll({
      where: { isActive: true, isAvailable: true },
      attributes: ['id', 'firstName', 'lastName', 'specialization', 'qualification', 'experience', 'consultationFee', 'profileImage', 'rating', 'totalReviews', 'bio'],
      order: [['rating', 'DESC'], ['totalReviews', 'DESC']],
      limit: 8,
    });

    await setCache('featured-doctors', doctors);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor stats (for dashboard)
router.get('/stats/overview', async (req, res) => {
  try {
    const totalDoctors = await Doctor.count({ where: { isActive: true } });
    const availableDoctors = await Doctor.count({ where: { isActive: true, isAvailable: true } });
    const specializations = await Doctor.findAll({
      attributes: ['specialization', [Doctor.sequelize.fn('COUNT', '*'), 'count']],
      where: { isActive: true },
      group: ['specialization'],
      raw: true,
    });
    res.json({ totalDoctors, availableDoctors, specializations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor profile by userId (for logged-in doctor)
router.get('/me/:userId', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.params.userId, isActive: true },
      include: [{ model: AvailabilitySlot, as: 'slots' }]
    });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: list all doctors including unverified
router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, verified } = req.query;
    const where = {};
    if (verified === 'true') where.isVerified = true;
    if (verified === 'false') where.isVerified = false;

    const { count, rows } = await Doctor.findAndCountAll({
      where,
      include: [{ model: AvailabilitySlot, as: 'slots', required: false }],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['createdAt', 'DESC']]
    });
    res.json({ doctors: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor by ID (must be AFTER all specific named routes)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: AvailabilitySlot, as: 'slots' }]
    });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register doctor profile (for newly registered doctor users)
router.post('/register', async (req, res) => {
  try {
    const { userId, specialization, licenseNumber, hospital, experience, fee, languages, education, bio } = req.body;
    if (!userId || !specialization) {
      return res.status(400).json({ error: 'userId and specialization are required' });
    }

    const existing = await Doctor.findOne({ where: { userId } });
    if (existing) {
      return res.status(409).json({ error: 'Doctor profile already exists for this user' });
    }

    const userName = req.headers['x-user-name'] || 'Doctor';
    const nameParts = userName.split(' ');

    const doctor = await Doctor.create({
      userId,
      firstName: nameParts[0] || 'Doctor',
      lastName: nameParts.slice(1).join(' ') || '',
      email: req.headers['x-user-email'] || '',
      specialization,
      licenseNumber: licenseNumber || '',
      hospital: hospital || '',
      experience: experience || 0,
      consultationFee: fee || 3000,
      languages: languages || ['English'],
      qualification: education || '',
      bio: bio || '',
      isVerified: false,
      isAvailable: false,
      isActive: true,
    });

    await invalidateCache('doctors:*');
    res.status(201).json(doctor);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Doctor profile already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update doctor profile by userId
router.put('/me/:userId', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.params.userId } });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

    const allowedFields = ['specialization', 'hospital', 'experience', 'consultationFee', 'languages', 'qualification', 'bio', 'profileImage', 'licenseNumber'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    await Doctor.update(updates, { where: { id: doctor.id } });
    await invalidateCache('doctors:*');
    const updated = await Doctor.findByPk(doctor.id, { include: [{ model: AvailabilitySlot, as: 'slots' }] });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update doctor availability slots by userId
router.put('/me/:userId/slots', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.params.userId } });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

    const { slots } = req.body;
    if (!Array.isArray(slots)) {
      return res.status(400).json({ error: 'slots must be an array' });
    }

    // Remove existing slots and create new ones
    await AvailabilitySlot.destroy({ where: { doctorId: doctor.id } });
    const created = await AvailabilitySlot.bulkCreate(
      slots.map(s => ({ ...s, doctorId: doctor.id }))
    );

    await invalidateCache('doctors:*');
    res.json({ message: 'Slots updated', slots: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create doctor
router.post('/', async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    await invalidateCache('doctors:*');
    res.status(201).json(doctor);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Doctor with this email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update doctor
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Doctor.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Doctor not found' });
    const doctor = await Doctor.findByPk(req.params.id);
    await invalidateCache('doctors:*');
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add availability slot
router.post('/:id/slots', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    const slot = await AvailabilitySlot.create({ ...req.body, doctorId: req.params.id });
    await invalidateCache('doctors:*');
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: verify a doctor
router.patch('/:id/verify', async (req, res) => {
  try {
    const [updated] = await Doctor.update(
      { isVerified: true, isAvailable: true },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ error: 'Doctor not found' });
    await invalidateCache('doctors:*');
    const doctor = await Doctor.findByPk(req.params.id);
    res.json({ message: 'Doctor verified', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

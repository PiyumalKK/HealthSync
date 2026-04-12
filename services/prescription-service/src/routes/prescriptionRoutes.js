const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { publishEvent } = require('../eventBus');

// Get all prescriptions
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    const total = await Prescription.countDocuments(query);
    res.json({ prescriptions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get prescription stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Prescription.countDocuments();
    const active = await Prescription.countDocuments({ status: 'active' });
    const completed = await Prescription.countDocuments({ status: 'completed' });
    res.json({ total, active, completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create prescription
router.post('/', async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();

    // Publish event to Service Bus (async, non-blocking)
    publishEvent('prescription-events', 'prescription.created', {
      prescriptionId: prescription._id.toString(),
      patientName: req.body.patientName,
      patientEmail: req.body.patientEmail,
      doctorEmail: req.headers['x-user-email'],
      doctorName: req.body.doctorName,
      diagnosis: req.body.diagnosis
    });

    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update prescription
router.put('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

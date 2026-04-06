const express = require('express');
const router = express.Router();
const { Appointment } = require('../models');
const { Op } = require('sequelize');

// Get all appointments (with filters)
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, status, date, page = 1, limit = 10 } = req.query;
    const where = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) where.appointmentDate = date;

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'ASC']]
    });

    res.json({ appointments: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointment stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Appointment.count();
    const pending = await Appointment.count({ where: { status: 'pending' } });
    const confirmed = await Appointment.count({ where: { status: 'confirmed' } });
    const completed = await Appointment.count({ where: { status: 'completed' } });
    const cancelled = await Appointment.count({ where: { status: 'cancelled' } });

    const today = new Date().toISOString().split('T')[0];
    const todayCount = await Appointment.count({ where: { appointmentDate: today } });

    res.json({ total, pending, confirmed, completed, cancelled, todayCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get upcoming appointments
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: { [Op.gte]: today },
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
      limit: 20
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create appointment
router.post('/', async (req, res) => {
  try {
    // Check for conflicting appointments
    const conflict = await Appointment.findOne({
      where: {
        doctorId: req.body.doctorId,
        appointmentDate: req.body.appointmentDate,
        appointmentTime: req.body.appointmentTime,
        status: { [Op.notIn]: ['cancelled'] }
      }
    });

    if (conflict) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create(req.body);

    // Fire event for notification service (async)
    try {
      const axios = require('axios');
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005';
      await axios.post(`${notificationUrl}/api/notifications`, {
        type: 'appointment_booked',
        recipientEmail: req.body.patientEmail,
        recipientName: req.body.patientName,
        data: {
          appointmentId: appointment.id,
          doctorName: req.body.doctorName,
          date: req.body.appointmentDate,
          time: req.body.appointmentTime
        }
      }).catch(() => {}); // Non-critical
    } catch {
      // Notification failure is non-critical
    }

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Appointment.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Appointment not found' });
    const appointment = await Appointment.findByPk(req.params.id);
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel appointment
router.patch('/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    await appointment.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: req.body.reason || 'Cancelled by user'
    });

    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor: Accept/Confirm appointment
router.patch('/:id/confirm', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: `Cannot confirm appointment with status: ${appointment.status}` });
    }

    await appointment.update({ status: 'confirmed', notes: req.body.notes || appointment.notes });

    // Notify patient
    try {
      const axios = require('axios');
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005';
      await axios.post(`${notificationUrl}/api/notifications`, {
        type: 'appointment_booked',
        recipientEmail: appointment.patientEmail,
        recipientName: appointment.patientName,
        data: { appointmentId: appointment.id, doctorName: appointment.doctorName, date: appointment.appointmentDate, time: appointment.appointmentTime }
      }).catch(() => {});
    } catch { /* non-critical */ }

    res.json({ message: 'Appointment confirmed', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor: Reject appointment
router.patch('/:id/reject', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject appointment with status: ${appointment.status}` });
    }

    await appointment.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: req.body.reason || 'Rejected by doctor'
    });

    try {
      const axios = require('axios');
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005';
      await axios.post(`${notificationUrl}/api/notifications`, {
        type: 'appointment_cancelled',
        recipientEmail: appointment.patientEmail,
        recipientName: appointment.patientName,
        data: { appointmentId: appointment.id, doctorName: appointment.doctorName, date: appointment.appointmentDate, time: appointment.appointmentTime }
      }).catch(() => {});
    } catch { /* non-critical */ }

    res.json({ message: 'Appointment rejected', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor: Mark appointment as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (!['confirmed', 'in-progress'].includes(appointment.status)) {
      return res.status(400).json({ error: `Cannot complete appointment with status: ${appointment.status}` });
    }
    await appointment.update({ status: 'completed', notes: req.body.notes || appointment.notes });
    res.json({ message: 'Appointment completed', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

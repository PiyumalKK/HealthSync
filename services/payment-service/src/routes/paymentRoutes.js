const express = require('express');
const router = express.Router();
const { Op, fn, col } = require('sequelize');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment } = require('../models/Payment');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create Stripe Checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { appointmentId, doctorId, doctorName, doctorEmail, amount } = req.body;
    const patientId = req.body.patientId || req.headers['x-user-id'];
    const patientName = req.body.patientName || req.headers['x-user-name'];
    const patientEmail = req.body.patientEmail || req.headers['x-user-email'];

    if (!appointmentId || !patientId || !doctorId || !amount) {
      return res.status(400).json({ error: 'appointmentId, patientId, doctorId, and amount are required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: patientEmail || undefined,
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `Consultation with Dr. ${doctorName}`,
            description: `Appointment ID: ${appointmentId}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      metadata: { appointmentId, patientId, doctorId },
      success_url: `${FRONTEND_URL}/payment/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment/result?cancelled=true`,
    });

    const payment = await Payment.create({
      appointmentId,
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      doctorEmail,
      amount,
      stripeSessionId: session.id,
      status: 'pending',
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payments (list)
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(limit);
    const { rows: payments, count: total } = await Payment.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Payment.count();
    const completed = await Payment.count({ where: { status: 'completed' } });
    const pending = await Payment.count({ where: { status: 'pending' } });
    const refunded = await Payment.count({ where: { status: 'refunded' } });

    const revenueResult = await Payment.findOne({
      where: { status: 'completed' },
      attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
      raw: true,
    });

    res.json({
      total,
      completed,
      pending,
      refunded,
      totalRevenue: Number(revenueResult?.total) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment status (called by frontend after redirect)
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const payment = await Payment.findOne({ where: { stripeSessionId: req.params.sessionId } });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (session.payment_status === 'paid' && payment.status !== 'completed') {
      await payment.update({
        status: 'completed',
        stripePaymentIntentId: session.payment_intent,
        paymentMethod: 'card',
        paidAt: new Date(),
      });

      // Update appointment status to confirmed (non-critical)
      try {
        const axios = require('axios');
        const appointmentUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:3003';
        await axios.patch(`${appointmentUrl}/api/${payment.appointmentId}/confirm`, {
          notes: 'Payment confirmed via Stripe',
        }).catch(() => {});
      } catch {
        // Non-critical
      }

      // Notify (non-critical)
      try {
        const axios = require('axios');
        const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005';
        const amountStr = `Rs. ${Number(payment.amount).toLocaleString()}`;
        // Notify patient
        await axios.post(`${notificationUrl}/api/notifications`, {
          type: 'payment_received',
          recipientName: payment.patientName,
          recipientEmail: payment.patientEmail,
          data: {
            appointmentId: payment.appointmentId,
            doctorName: payment.doctorName,
            amount: amountStr,
          },
        }).catch(() => {});
        // Notify doctor
        if (payment.doctorEmail) {
          await axios.post(`${notificationUrl}/api/notifications`, {
            type: 'payment_received_doctor',
            recipientName: payment.doctorName,
            recipientEmail: payment.doctorEmail,
            data: {
              appointmentId: payment.appointmentId,
              doctorName: payment.doctorName,
              patientName: payment.patientName,
              amount: amountStr,
            },
          }).catch(() => {});
        }
      } catch {
        // Non-critical
      }
    }

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment by ID (must be after /stats and /verify to avoid catching those)
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refund payment
router.post('/:id/refund', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'completed') return res.status(400).json({ error: 'Only completed payments can be refunded' });

    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    await payment.update({ status: 'refunded', refundId: refund.id });

    res.json({ message: 'Refund processed', refundId: refund.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

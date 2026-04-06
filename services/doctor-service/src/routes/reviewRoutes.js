const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { Doctor } = require('../models');
const { Op } = require('sequelize');

// Get reviews for a doctor (public)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const order = sort === 'highest' ? [['rating', 'DESC']] :
                  sort === 'lowest' ? [['rating', 'ASC']] :
                  [['createdAt', 'DESC']];

    const { count, rows } = await Review.findAndCountAll({
      where: { doctorId: req.params.doctorId, isVisible: true },
      order,
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    // Calculate rating distribution
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = await Review.count({
        where: { doctorId: req.params.doctorId, isVisible: true, rating: i }
      });
    }

    const avgResult = await Review.findOne({
      where: { doctorId: req.params.doctorId, isVisible: true },
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'totalCount'],
      ],
      raw: true,
    });

    res.json({
      reviews: rows,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      averageRating: parseFloat(avgResult?.avgRating || 0).toFixed(1),
      totalReviews: parseInt(avgResult?.totalCount || 0),
      distribution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create review
router.post('/', async (req, res) => {
  try {
    const { doctorId, rating, title, comment, appointmentId } = req.body;
    const patientId = req.headers['x-user-id'] || req.body.patientId;
    const patientName = req.headers['x-user-name'] || req.body.patientName;

    if (!doctorId || !rating || !patientId) {
      return res.status(400).json({ error: 'Doctor ID, rating, and patient ID are required' });
    }

    // Check if patient already reviewed this doctor for same appointment
    if (appointmentId) {
      const existing = await Review.findOne({ where: { doctorId, patientId, appointmentId } });
      if (existing) {
        return res.status(409).json({ error: 'You already reviewed this appointment' });
      }
    }

    const review = await Review.create({
      doctorId,
      patientId,
      patientName: patientName || 'Anonymous Patient',
      patientAvatar: req.body.patientAvatar,
      appointmentId,
      rating,
      title,
      comment,
      isVerified: !!appointmentId,
    });

    // Update doctor's average rating
    const avgResult = await Review.findOne({
      where: { doctorId, isVisible: true },
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'totalCount'],
      ],
      raw: true,
    });

    await Doctor.update(
      {
        rating: parseFloat(avgResult.avgRating).toFixed(1),
        totalReviews: parseInt(avgResult.totalCount),
      },
      { where: { id: doctorId } }
    );

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark review helpful
router.patch('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    review.helpfulCount += 1;
    await review.save();
    res.json({ helpfulCount: review.helpfulCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

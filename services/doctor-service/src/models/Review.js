const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  doctorId: { type: DataTypes.UUID, allowNull: false },
  patientId: { type: DataTypes.STRING, allowNull: false },
  patientName: { type: DataTypes.STRING, allowNull: false },
  patientAvatar: { type: DataTypes.STRING },
  appointmentId: { type: DataTypes.UUID },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING },
  comment: { type: DataTypes.TEXT },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
  helpfulCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  response: { type: DataTypes.TEXT },
  respondedAt: { type: DataTypes.DATE },
}, { timestamps: true });

module.exports = Review;

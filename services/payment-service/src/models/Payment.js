const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'healthsync_payments',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
    ...(process.env.DB_SSL === 'true' && {
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
    })
  }
);

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  appointmentId: { type: DataTypes.STRING, allowNull: false },
  patientId: { type: DataTypes.STRING, allowNull: false },
  patientName: { type: DataTypes.STRING, allowNull: false },
  patientEmail: { type: DataTypes.STRING },
  doctorId: { type: DataTypes.STRING, allowNull: false },
  doctorName: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'lkr' },
  stripeSessionId: { type: DataTypes.STRING, unique: true },
  stripePaymentIntentId: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentMethod: { type: DataTypes.STRING },
  receiptUrl: { type: DataTypes.STRING },
  refundId: { type: DataTypes.STRING },
  paidAt: { type: DataTypes.DATE },
}, { timestamps: true });

module.exports = { sequelize, Payment };

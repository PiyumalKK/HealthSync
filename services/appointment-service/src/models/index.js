const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'healthsync_appointments',
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

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patientId: { type: DataTypes.STRING, allowNull: false },
  patientName: { type: DataTypes.STRING, allowNull: false },
  patientEmail: { type: DataTypes.STRING },
  doctorId: { type: DataTypes.UUID, allowNull: false },
  doctorName: { type: DataTypes.STRING, allowNull: false },
  specialization: { type: DataTypes.STRING },
  appointmentDate: { type: DataTypes.DATEONLY, allowNull: false },
  appointmentTime: { type: DataTypes.TIME, allowNull: false },
  duration: { type: DataTypes.INTEGER, defaultValue: 30 }, // minutes
  type: { type: DataTypes.ENUM('consultation', 'follow-up', 'emergency', 'routine-checkup'), defaultValue: 'consultation' },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'), defaultValue: 'pending' },
  reason: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  consultationFee: { type: DataTypes.DECIMAL(10, 2) },
  cancelledAt: { type: DataTypes.DATE },
  cancelReason: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = { sequelize, Appointment };

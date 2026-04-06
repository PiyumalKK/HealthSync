const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'healthsync_doctors',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 }
  }
);

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.STRING, unique: true }, // Links to auth User._id
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING },
  specialization: { type: DataTypes.STRING, allowNull: false },
  qualification: { type: DataTypes.STRING },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  consultationFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  bio: { type: DataTypes.TEXT },
  profileImage: { type: DataTypes.STRING },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
  totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  licenseNumber: { type: DataTypes.STRING },
  hospital: { type: DataTypes.STRING },
  languages: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: ['Sinhala', 'English'] }
}, { timestamps: true });

const AvailabilitySlot = sequelize.define('AvailabilitySlot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  dayOfWeek: { type: DataTypes.INTEGER, allowNull: false }, // 0=Sun, 6=Sat
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

Doctor.hasMany(AvailabilitySlot, { foreignKey: 'doctorId', as: 'slots' });
AvailabilitySlot.belongsTo(Doctor, { foreignKey: 'doctorId' });

module.exports = { sequelize, Doctor, AvailabilitySlot };

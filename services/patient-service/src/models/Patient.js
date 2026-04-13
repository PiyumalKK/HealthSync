const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  condition: { type: String, required: true },
  diagnosedDate: Date,
  notes: String,
  status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' }
}, { _id: true, timestamps: true });

const patientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'US' }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: [medicalHistorySchema],
  allergies: [String],
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  profileImage: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

patientSchema.index({ email: 1 });
patientSchema.index({ userId: 1 });
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);

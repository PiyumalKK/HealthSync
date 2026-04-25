const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: String,
  quantity: Number
}, { _id: true });

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { type: String },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  diagnosis: { type: String, required: true },
  medicines: [medicineSchema],
  additionalNotes: String,
  followUpDate: Date,
  pdfUrl: String,
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
  issuedDate: { type: Date, default: Date.now },
  validUntil: Date
}, { timestamps: true });

prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ appointmentId: 1 });
prescriptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);

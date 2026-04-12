const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  avatar: { type: String },
  coverImage: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, sparse: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshTokens: [{ token: String, expiresAt: Date, userAgent: String }],
  preferences: {
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  onboardingCompleted: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    firstName: this.firstName,
    lastName: this.lastName,
    avatar: this.avatar,
    coverImage: this.coverImage,
    phone: this.phone,
    role: this.role,
    provider: this.provider,
    isVerified: this.isVerified,
    preferences: this.preferences,
    onboardingCompleted: this.onboardingCompleted,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);

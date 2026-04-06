import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const steps = [
  { id: 1, title: 'Account', desc: 'Create your account' },
  { id: 2, title: 'Personal', desc: 'Tell us about yourself' },
  { id: 3, title: 'Complete', desc: 'You\'re all set!' },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    role: 'patient',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && !validateStep1()) return;
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim() || formData.email.split('@')[0],
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        role: formData.role,
      });
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80"
          alt="Medical team"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-blue-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">HealthSync</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Join <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Thousands</span><br />
              of Happy Patients
            </h2>
            <p className="text-white/70 text-lg max-w-md mb-10">
              Create your free account today and get instant access to premium healthcare services.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                { icon: '🏥', text: 'Access to 500+ verified specialists across Sri Lanka' },
                { icon: '📅', text: 'Easy online appointment booking' },
                { icon: '💊', text: 'Digital prescriptions & records' },
                { icon: '🔔', text: 'Real-time health notifications' },
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">{benefit.icon}</span>
                  <span className="text-white/70">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep > step.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : currentStep === step.id
                      ? 'bg-white/10 text-white border-2 border-cyan-500'
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.id}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= step.id ? 'text-white/60' : 'text-white/20'}`}>
                    {step.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
                <p className="text-white/50 mb-8">Start your health journey today</p>

                {/* Google Sign Up */}
                <div className="mb-6">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-up failed')}
                    theme="filled_black"
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="pill"
                  />
                </div>

                <div className="relative flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-sm">or use email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        required
                        className="w-full px-4 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showPassword
                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          } />
                        </svg>
                      </button>
                    </div>
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                              i <= strength ? strengthColors[strength] : 'bg-white/10'
                            }`} />
                          ))}
                        </div>
                        <p className={`text-xs ${strength >= 4 ? 'text-green-400' : strength >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {strengthLabels[strength]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Confirm password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords don&apos;t match</p>
                    )}
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">Personal details</h1>
                <p className="text-white/50 mb-8">Help us personalize your experience</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'patient', label: 'Patient', desc: 'Book appointments' },
                        { value: 'doctor', label: 'Doctor', desc: 'Manage patients' },
                      ].map((r) => (
                        <button
                          type="button"
                          key={r.value}
                          onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${
                            formData.role === r.value
                              ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400'
                              : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          <span className="block font-semibold">{r.label}</span>
                          <span className="block text-xs opacity-60">{r.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">First name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Kamal"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Last name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Perera"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Phone number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94-77-123-4567"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Date of birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setFormData(prev => ({ ...prev, gender: g.toLowerCase() }))}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
                            formData.gender === g.toLowerCase()
                              ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400'
                              : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                    />
                    <label htmlFor="agreeTerms" className="text-sm text-white/50">
                      I agree to the{' '}
                      <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer">Terms of Service</span>{' '}
                      and{' '}
                      <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer">Privacy Policy</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      type="button"
                      onClick={handleBack}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex-1 py-3.5 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex-[2] py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating account...
                        </>
                      ) : (
                        'Create account'
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
                >
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>

                <h1 className="text-3xl font-bold text-white mb-3">Welcome aboard!</h1>
                <p className="text-white/50 mb-8 max-w-sm mx-auto">
                  Your account has been created successfully. {formData.role === 'doctor' ? 'Complete your doctor profile to start accepting patients.' : 'You\'re now ready to explore HealthSync.'}
                </p>

                <motion.button
                  onClick={() => navigate(formData.role === 'doctor' ? '/doctor/register' : '/dashboard')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                >
                  {formData.role === 'doctor' ? 'Complete Doctor Profile' : 'Go to Dashboard'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Link */}
          {currentStep < 3 && (
            <p className="mt-8 text-center text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

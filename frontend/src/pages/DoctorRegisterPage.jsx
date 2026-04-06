import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { doctorsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Stethoscope, Upload, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const specializations = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
  'Psychiatry', 'Ophthalmology', 'General Medicine', 'Gynecology', 'ENT',
  'Urology', 'Pulmonology', 'Endocrinology', 'Oncology', 'Gastroenterology'
]

export default function DoctorRegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    bio: '',
    licenseNumber: '',
    hospital: '',
    languages: ['Sinhala', 'English'],
    phone: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.specialization || !formData.qualification || !formData.licenseNumber) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      await doctorsAPI.register({
        userId: user.id,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: formData.phone,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: parseInt(formData.experience) || 0,
        consultationFee: parseFloat(formData.consultationFee) || 0,
        bio: formData.bio,
        licenseNumber: formData.licenseNumber,
        hospital: formData.hospital,
        languages: formData.languages,
      })
      setSuccess(true)
      toast.success('Doctor profile submitted for verification!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <Navbar />
        <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Profile Submitted!</h2>
            <p className="text-white/50 mb-8">Your doctor profile has been submitted for verification. An admin will review and verify your credentials. You'll be notified once approved.</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Back to Home
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />
      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Register as a Doctor</h1>
            <p className="text-white/50">Complete your professional profile to start accepting patients</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Specialization *</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                required
              >
                <option value="" className="bg-slate-900">Select specialization</option>
                {specializations.map(s => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Qualification *</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., MD, FACC - University of Colombo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">SLMC License Number *</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="e.g., SLMC-12345"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Hospital / Clinic</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="e.g., National Hospital Colombo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  max="60"
                  placeholder="e.g., 10"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Consultation Fee (LKR)</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 3500"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94-77-123-4567"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {['Sinhala', 'English', 'Tamil'].map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.languages.includes(lang)
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell patients about your experience and expertise..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

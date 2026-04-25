import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { prescriptionsAPI, appointmentsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FileText, Plus, Trash2, Send, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PrescriptionCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [confirmedAppointments, setConfirmedAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  const [formData, setFormData] = useState({
    patientName: searchParams.get('patientName') || '',
    patientEmail: searchParams.get('patientEmail') || '',
    patientId: searchParams.get('patientId') || '',
    appointmentId: searchParams.get('appointmentId') || '',
    diagnosis: '',
    notes: '',
    followUpDate: '',
  })

  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])

  // Fetch confirmed/completed appointments for this doctor
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const [confirmedRes, completedRes] = await Promise.all([
          appointmentsAPI.getAll({ doctorId: user.id, status: 'confirmed', limit: 50 }),
          appointmentsAPI.getAll({ doctorId: user.id, status: 'completed', limit: 50 }),
        ])
        const confirmed = confirmedRes.data?.appointments || []
        const completed = completedRes.data?.appointments || []
        setConfirmedAppointments([...confirmed, ...completed])
      } catch (err) {
        console.error('Failed to fetch appointments:', err)
      } finally {
        setLoadingAppointments(false)
      }
    }
    if (user?.id) fetchAppointments()
  }, [user?.id])

  const handleSelectAppointment = (appointmentId) => {
    if (!appointmentId) {
      setFormData(prev => ({ ...prev, appointmentId: '', patientId: '', patientName: '', patientEmail: '' }))
      return
    }
    const appt = confirmedAppointments.find(a => a.id === appointmentId)
    if (appt) {
      setFormData(prev => ({
        ...prev,
        appointmentId: appt.id,
        patientId: appt.patientId,
        patientName: appt.patientName || '',
        patientEmail: appt.patientEmail || '',
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMedChange = (index, field, value) => {
    setMedications(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const addMedication = () => {
    setMedications(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.patientName || !formData.diagnosis || medications.some(m => !m.name)) {
      toast.error('Please fill in patient name, diagnosis, and at least one medication')
      return
    }
    setLoading(true)
    try {
      await prescriptionsAPI.create({
        doctorId: user.id,
        doctorName: user.name,
        patientId: formData.patientId || `patient_${Date.now()}`,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        appointmentId: formData.appointmentId || `walk-in_${Date.now()}`,
        diagnosis: formData.diagnosis,
        medicines: medications.filter(m => m.name),
        additionalNotes: formData.notes,
        followUpDate: formData.followUpDate || undefined,
      })
      toast.success('Prescription created successfully!')
      navigate('/doctor/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Write Prescription</h1>
              <p className="text-white/50 text-sm">Create a digital prescription for your patient</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Select Patient
              </h3>

              {/* Appointment Dropdown */}
              <div className="mb-4">
                <label className="block text-sm text-white/50 mb-1">Select from Confirmed Appointments</label>
                <select
                  value={formData.appointmentId}
                  onChange={(e) => handleSelectAppointment(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
                >
                  <option value="" className="bg-slate-900 text-white">
                    {loadingAppointments ? 'Loading appointments...' : '-- Select a patient appointment --'}
                  </option>
                  {confirmedAppointments.map(appt => (
                    <option key={appt.id} value={appt.id} className="bg-slate-900 text-white">
                      {appt.patientName} — {appt.appointmentDate} {appt.appointmentTime} ({appt.status})
                    </option>
                  ))}
                </select>
                {!loadingAppointments && confirmedAppointments.length === 0 && (
                  <p className="text-amber-400/70 text-xs mt-1">No confirmed or completed appointments found. You can enter patient info manually below.</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    placeholder="e.g., Sanduni Jayasuriya"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Patient Email</label>
                  <input
                    type="email"
                    name="patientEmail"
                    value={formData.patientEmail}
                    onChange={handleChange}
                    placeholder="patient@healthsync.lk"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Diagnosis</h3>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Enter primary diagnosis"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>

            {/* Medications */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Medications</h3>
                <button
                  type="button"
                  onClick={addMedication}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medications.map((med, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/40">Medication #{index + 1}</span>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                        placeholder="Medication name *"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                        placeholder="Dosage (e.g., 500mg)"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                        placeholder="Frequency (e.g., Twice daily)"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                        placeholder="Duration (e.g., 7 days)"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleMedChange(index, 'instructions', e.target.value)}
                      placeholder="Special instructions (e.g., Take after meals)"
                      className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Notes & Follow-up */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Additional Notes</h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes or instructions for the patient..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none mb-4"
              />
              <div>
                <label className="block text-sm text-white/50 mb-1">Follow-up Date (optional)</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Prescription'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

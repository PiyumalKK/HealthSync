import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { doctorsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Clock, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function DoctorAvailabilityPage() {
  const { user } = useAuth()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [noProfile, setNoProfile] = useState(false)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const res = await doctorsAPI.getMyProfile(user.id)
      const doctor = res.data?.doctor || res.data
      if (doctor?.availabilitySlots) {
        setSlots(doctor.availabilitySlots.map(s => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })))
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setNoProfile(true)
      } else {
        console.error('Failed to load slots:', err)
        toast.error('Failed to load schedule')
      }
    } finally {
      setLoading(false)
    }
  }

  const addSlot = (dayOfWeek) => {
    setSlots(prev => [...prev, { dayOfWeek, startTime: '09:00', endTime: '17:00' }])
  }

  const removeSlot = (index) => {
    setSlots(prev => prev.filter((_, i) => i !== index))
  }

  const updateSlot = (index, field, value) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await doctorsAPI.updateMySlots(user.id, slots)
      toast.success('Schedule updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update schedule')
    } finally {
      setSaving(false)
    }
  }

  const groupedByDay = dayNames.reduce((acc, _, dayIndex) => {
    acc[dayIndex] = slots
      .map((s, i) => ({ ...s, originalIndex: i }))
      .filter(s => s.dayOfWeek === dayIndex)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-spin border-t-cyan-400" />
      </div>
    )
  }

  if (noProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <Navbar />
        <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Complete Your Profile First</h2>
            <p className="text-white/50 mb-6 max-w-md">You need to register your doctor profile before managing your schedule.</p>
            <Link
              to="/doctor/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Register Profile
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Schedule</h1>
                <p className="text-white/50 text-sm">Manage your weekly availability</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-4">
            {dayNames.map((day, dayIndex) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{day}</h3>
                  <button
                    type="button"
                    onClick={() => addSlot(dayIndex)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slot
                  </button>
                </div>

                {groupedByDay[dayIndex].length === 0 ? (
                  <p className="text-white/30 text-sm py-2">No slots — Day off</p>
                ) : (
                  <div className="space-y-2">
                    {groupedByDay[dayIndex].map((slot) => (
                      <div key={slot.originalIndex} className="flex items-center gap-3">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(slot.originalIndex, 'startTime', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <span className="text-white/30">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(slot.originalIndex, 'endTime', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => removeSlot(slot.originalIndex)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

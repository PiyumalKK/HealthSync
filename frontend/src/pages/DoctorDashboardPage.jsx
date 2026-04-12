import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { appointmentsAPI, doctorsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Calendar, Clock, CheckCircle, XCircle, User, FileText,
  Activity, AlertCircle, ChevronRight, Search, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-progress': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function DoctorDashboardPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [apptRes, profileRes] = await Promise.all([
        appointmentsAPI.getAll({ limit: 50 }),
        doctorsAPI.getMyProfile(user.id).catch(() => null),
      ])
      setAppointments(apptRes.data?.appointments || apptRes.data || [])
      setDoctorProfile(profileRes?.data?.doctor || profileRes?.data || null)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id) => {
    setActionLoading(id)
    try {
      await appointmentsAPI.confirm(id)
      toast.success('Appointment confirmed')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to confirm')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      await appointmentsAPI.reject(id, 'Rejected by doctor')
      toast.success('Appointment rejected')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (id) => {
    setActionLoading(id)
    try {
      await appointmentsAPI.complete(id)
      toast.success('Appointment marked as completed')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setAvatarUploading(true)
    try {
      const { data } = await doctorsAPI.uploadAvatar(file)
      if (doctorProfile) {
        setDoctorProfile(prev => ({ ...prev, profileImage: data.profileImage }))
      }
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Cover must be under 10MB'); return }
    setCoverUploading(true)
    try {
      const { data } = await doctorsAPI.uploadCover(file)
      if (doctorProfile) {
        setDoctorProfile(prev => ({ ...prev, coverImage: data.coverImage }))
      }
      toast.success('Cover image updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload')
    } finally {
      setCoverUploading(false)
      e.target.value = ''
    }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const todayCount = appointments.filter(a => {
    const d = new Date(a.appointmentDate)
    const today = new Date()
    return d.toDateString() === today.toDateString() && ['pending', 'confirmed', 'in-progress'].includes(a.status)
  }).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-spin border-t-cyan-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, Dr. {user?.name?.split(' ').pop() || user?.name}
          </h1>
          <p className="text-white/50">Manage your appointments and patients</p>
        </motion.div>

        {/* Registration prompt if no profile */}
        {!doctorProfile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Complete Your Profile</h3>
              <p className="text-white/50 text-sm">Register your professional profile to start accepting appointments and manage your schedule.</p>
            </div>
            <Link
              to="/doctor/register"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex-shrink-0"
            >
              Register Now
            </Link>
          </motion.div>
        )}

        {/* Doctor Profile Card with DP + Cover */}
        {doctorProfile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Cover Image */}
            <div className="h-36 relative group cursor-pointer" onClick={() => coverInputRef.current?.click()}>
              <img
                src={doctorProfile.coverImage || 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&h=300&fit=crop'}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {coverUploading ? (
                  <div className="w-8 h-8 border-4 border-white/30 rounded-full animate-spin border-t-white" />
                ) : (
                  <span className="text-white text-sm font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Change Cover
                  </span>
                )}
              </div>
              <input type="file" ref={coverInputRef} accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverUpload} className="hidden" />
            </div>
            {/* Profile Info */}
            <div className="px-6 pb-5 flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 relative z-10">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-800">
                  <img
                    src={doctorProfile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorProfile.firstName + ' ' + doctorProfile.lastName)}&background=0ea5e9&color=fff&size=200`}
                    alt={`Dr. ${doctorProfile.firstName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  {avatarUploading ? (
                    <div className="w-6 h-6 border-2 border-white/30 rounded-full animate-spin border-t-white" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </div>
                <input type="file" ref={avatarInputRef} accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Dr. {doctorProfile.firstName} {doctorProfile.lastName}</h2>
                <p className="text-white/50 text-sm">{doctorProfile.specialization} • {doctorProfile.hospital || 'Independent'}</p>
              </div>
              {doctorProfile.isVerified && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">Verified</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's Appointments", value: todayCount, icon: Calendar, color: 'from-cyan-500 to-blue-500' },
            { label: 'Pending Requests', value: pendingCount, icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
            { label: 'Confirmed', value: confirmedCount, icon: CheckCircle, color: 'from-blue-500 to-indigo-500' },
            { label: 'Completed', value: completedCount, icon: Activity, color: 'from-emerald-500 to-green-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/doctor/prescriptions/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
            <FileText className="w-4 h-4" /> Write Prescription
          </Link>
          <Link to="/doctor/availability" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/15 transition-all">
            <Clock className="w-4 h-4" /> Manage Schedule
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-500/30 text-amber-400 text-xs rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No appointments found</p>
            </div>
          ) : (
            filtered.map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{appt.patientName || 'Patient'}</h3>
                      <p className="text-white/40 text-sm">{appt.patientEmail}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-sm text-white/50">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(appt.appointmentDate).toLocaleDateString('en-LK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-white/50">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.appointmentTime}
                        </span>
                        {appt.type && (
                          <span className="text-sm text-white/40 bg-white/5 px-2 py-0.5 rounded">{appt.type}</span>
                        )}
                      </div>
                      {appt.reason && (
                        <p className="text-white/30 text-sm mt-1">Reason: {appt.reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[appt.status] || 'bg-white/10 text-white/50'}`}>
                      {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1).replace('-', ' ')}
                    </span>

                    {appt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirm(appt.id)}
                          disabled={actionLoading === appt.id}
                          className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                          title="Accept"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(appt.id)}
                          disabled={actionLoading === appt.id}
                          className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {(appt.status === 'confirmed' || appt.status === 'in-progress') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleComplete(appt.id)}
                          disabled={actionLoading === appt.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium disabled:opacity-50"
                        >
                          Mark Complete
                        </button>
                        <Link
                          to={`/doctor/prescriptions/new?appointmentId=${appt.id}&patientName=${encodeURIComponent(appt.patientName || '')}&patientEmail=${encodeURIComponent(appt.patientEmail || '')}`}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm font-medium"
                        >
                          Write Rx
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

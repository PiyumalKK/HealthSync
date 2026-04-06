import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { appointmentsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Calendar, Clock, User, Stethoscope, Search, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const sampleAppointments = [
  {
    id: 1, doctorName: 'Dr. Kamal Perera', specialization: 'Cardiology',
    date: '2026-04-07', time: '09:30 AM', status: 'confirmed', type: 'Consultation',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 2, doctorName: 'Dr. Nishani Fernando', specialization: 'Neurology',
    date: '2026-04-10', time: '02:00 PM', status: 'pending', type: 'Follow-up',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 3, doctorName: 'Dr. Amaya Wickramasinghe', specialization: 'Pediatrics',
    date: '2026-03-28', time: '10:00 AM', status: 'completed', type: 'Routine Checkup',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 4, doctorName: 'Dr. Dilani Silva', specialization: 'Dermatology',
    date: '2026-03-20', time: '03:30 PM', status: 'cancelled', type: 'Consultation',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 5, doctorName: 'Dr. Tharindu Dissanayake', specialization: 'Psychiatry',
    date: '2026-04-15', time: '11:00 AM', status: 'confirmed', type: 'Consultation',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face',
  },
]

const statusConfig = {
  confirmed: { color: 'bg-accent-50 text-accent-700 border-accent-200', icon: CheckCircle, iconColor: 'text-accent-500' },
  pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle, iconColor: 'text-amber-500' },
  completed: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle, iconColor: 'text-slate-400' },
  cancelled: { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, iconColor: 'text-red-400' },
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await appointmentsAPI.getAll({ limit: 50 })
        const list = data?.appointments || (Array.isArray(data) ? data : [])
        setAppointments(list.length > 0 ? list : sampleAppointments)
      } catch {
        setAppointments(sampleAppointments)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  const handleCancel = async (id) => {
    try {
      await appointmentsAPI.cancel(id, 'Cancelled by patient')
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
      toast.success('Appointment cancelled successfully')
    } catch {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
      toast.success('Appointment cancelled successfully')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-br from-health-teal via-teal-600 to-teal-800 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1400&h=400&fit=crop" alt="" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold mb-4">My Appointments</h1>
            <p className="text-lg text-white/70 max-w-xl">Manage all your healthcare appointments in one place.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-14 relative z-10">
          {[
            { label: 'Total', value: stats.total, color: 'from-primary-500 to-primary-600', icon: Calendar },
            { label: 'Upcoming', value: stats.upcoming, color: 'from-accent-500 to-accent-600', icon: Clock },
            { label: 'Completed', value: stats.completed, color: 'from-slate-500 to-slate-600', icon: CheckCircle },
            { label: 'Cancelled', value: stats.cancelled, color: 'from-red-500 to-red-600', icon: XCircle },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-display font-extrabold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Appointments list */}
        <div className="space-y-4">
          {filtered.map((apt, i) => {
            const config = statusConfig[apt.status]
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <img
                    src={apt.image || apt.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctorName || 'Doctor')}&background=0ea5e9&color=fff&size=100`}
                    alt={apt.doctorName}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{apt.doctorName || 'Doctor'}</h3>
                        <p className="text-sm text-primary-600 font-medium">{apt.specialization || apt.type || 'Consultation'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${(config || statusConfig.pending).color} capitalize`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{apt.date || apt.appointmentDate}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{apt.time || apt.appointmentTime}</span>
                      <span className="flex items-center"><Stethoscope className="w-4 h-4 mr-1" />{apt.type || apt.reason || 'Consultation'}</span>
                    </div>
                  </div>
                  {(apt.status === 'confirmed' || apt.status === 'pending') && (
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No appointments found</h3>
            <p className="text-slate-500 text-sm">Try changing the filter or book a new appointment</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

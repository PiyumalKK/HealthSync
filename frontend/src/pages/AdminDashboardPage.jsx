import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { doctorsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Shield, Users, CheckCircle, XCircle, Clock, Search,
  ChevronLeft, ChevronRight, Eye, BadgeCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(null)
  const limit = 10

  useEffect(() => {
    fetchDoctors()
  }, [page, filter])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (filter !== 'all') params.verified = filter === 'verified'
      const res = await doctorsAPI.adminGetAll(params)
      setDoctors(res.data?.doctors || res.data?.rows || [])
      setTotal(res.data?.total || res.data?.count || 0)
    } catch (err) {
      console.error('Failed to load doctors:', err)
      toast.error('Failed to load doctors list')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (doctorId) => {
    setVerifyLoading(doctorId)
    try {
      await doctorsAPI.verify(doctorId)
      toast.success('Doctor verified successfully!')
      fetchDoctors()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed')
    } finally {
      setVerifyLoading(null)
    }
  }

  const filteredDoctors = search
    ? doctors.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase())
      )
    : doctors

  const totalPages = Math.ceil(total / limit)
  const verifiedCount = doctors.filter(d => d.isVerified).length
  const unverifiedCount = doctors.filter(d => !d.isVerified).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/50 text-sm">Manage doctors and platform settings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <Users className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-sm text-white/40">Total Doctors</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <BadgeCheck className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">{verifiedCount}</p>
              <p className="text-sm text-white/40">Verified</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <Clock className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-2xl font-bold text-white">{unverifiedCount}</p>
              <p className="text-sm text-white/40">Pending Verification</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialization, or email..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'verified', 'unverified'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    filter === f
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-cyan-500/30 rounded-full animate-spin border-t-cyan-400" />
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-sm font-medium text-white/40 px-5 py-4">Doctor</th>
                      <th className="text-left text-sm font-medium text-white/40 px-5 py-4">Specialization</th>
                      <th className="text-left text-sm font-medium text-white/40 px-5 py-4">License</th>
                      <th className="text-left text-sm font-medium text-white/40 px-5 py-4">Hospital</th>
                      <th className="text-left text-sm font-medium text-white/40 px-5 py-4">Status</th>
                      <th className="text-right text-sm font-medium text-white/40 px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.firstName + ' ' + doctor.lastName)}&background=0ea5e9&color=fff&size=80`}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <div>
                              <p className="text-white font-medium text-sm">Dr. {doctor.firstName} {doctor.lastName}</p>
                              <p className="text-white/30 text-xs">{doctor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-white/60 text-sm">{doctor.specialization}</td>
                        <td className="px-5 py-4 text-white/60 text-sm font-mono">{doctor.licenseNumber || '—'}</td>
                        <td className="px-5 py-4 text-white/60 text-sm">{doctor.hospital || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            doctor.isVerified
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {doctor.isVerified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {doctor.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {!doctor.isVerified && (
                            <button
                              onClick={() => handleVerify(doctor.id)}
                              disabled={verifyLoading === doctor.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                            >
                              <BadgeCheck className="w-4 h-4" />
                              {verifyLoading === doctor.id ? 'Verifying...' : 'Verify'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
                  <p className="text-sm text-white/40">
                    Page {page} of {totalPages} ({total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

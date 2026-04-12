import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { doctorsAPI, appointmentsAPI, paymentsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'
import {
  Star, Clock, MapPin, Phone, Mail, Award, Calendar, ArrowLeft,
  CheckCircle, ChevronRight, GraduationCap, Briefcase
} from 'lucide-react'

const doctorData = {
  '1': {
    firstName: 'Kamal', lastName: 'Perera', specialization: 'Cardiology',
    qualification: 'MBBS, MD - University of Colombo', experience: 15,
    consultationFee: 5000, rating: 4.9, totalReviews: 328,
    bio: 'Board-certified cardiologist with 15+ years of experience at National Hospital Colombo. Specializes in heart failure management, preventive cardiac care, and cardiovascular imaging.',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-123-4567', email: 'kamal.perera@healthsync.lk',
    languages: ['English', 'Sinhala'],
    education: ['University of Colombo - MBBS', 'National Hospital Colombo - Residency', 'Lanka Hospitals - Fellowship in Cardiology'],
  },
  '2': {
    firstName: 'Nishani', lastName: 'Fernando', specialization: 'Neurology',
    qualification: 'MBBS, MD - University of Peradeniya', experience: 12,
    consultationFee: 6000, rating: 4.8, totalReviews: 256,
    bio: 'Neurologist specializing in movement disorders, headache medicine, and neurodegenerative diseases. Leading researcher in neurological care at Teaching Hospital Kandy.',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-234-5678', email: 'nishani.fernando@healthsync.lk',
    languages: ['English', 'Sinhala', 'Tamil'],
    education: ['University of Peradeniya - MBBS, MD', 'Teaching Hospital Kandy - Neurology Residency'],
  },
  '3': {
    firstName: 'Amaya', lastName: 'Wickramasinghe', specialization: 'Pediatrics',
    qualification: 'MBBS, DCH - University of Kelaniya', experience: 10,
    consultationFee: 3500, rating: 4.9, totalReviews: 412,
    bio: 'Compassionate pediatrician dedicated to comprehensive healthcare for children from newborns to adolescents at Lady Ridgeway Hospital.',
    profileImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-345-6789', email: 'amaya.w@healthsync.lk',
    languages: ['English', 'Sinhala'],
    education: ['University of Kelaniya - MBBS', 'Lady Ridgeway Hospital - Pediatrics Residency'],
  },
  '4': {
    firstName: 'Ruwan', lastName: 'Jayawardena', specialization: 'Orthopedics',
    qualification: 'MBBS, MS - University of Sri Jayewardenepura', experience: 18,
    consultationFee: 5500, rating: 4.7, totalReviews: 289,
    bio: 'Orthopedic surgeon specializing in sports medicine, joint replacement, and minimally invasive procedures at Asiri Surgical Hospital.',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-456-7890', email: 'ruwan.j@healthsync.lk',
    languages: ['English', 'Sinhala'],
    education: ['University of Sri Jayewardenepura - MBBS', 'Asiri Surgical Hospital - Orthopedic Residency'],
  },
  '5': {
    firstName: 'Dilani', lastName: 'Silva', specialization: 'Dermatology',
    qualification: 'MBBS, MD - University of Colombo', experience: 8,
    consultationFee: 4500, rating: 4.8, totalReviews: 195,
    bio: 'Dermatologist with expertise in medical and cosmetic dermatology at Nawaloka Hospital. Specializes in skin cancer screening and acne treatment.',
    profileImage: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-567-8901', email: 'dilani.silva@healthsync.lk',
    languages: ['English', 'Sinhala'],
    education: ['University of Colombo - MBBS', 'Nawaloka Hospital - Dermatology'],
  },
  '6': {
    firstName: 'Tharindu', lastName: 'Dissanayake', specialization: 'Psychiatry',
    qualification: 'MBBS, MD - University of Peradeniya', experience: 11,
    consultationFee: 4000, rating: 4.9, totalReviews: 367,
    bio: 'Psychiatrist focused on mood disorders, anxiety, and PTSD. Integrates evidence-based psychotherapy with pharmacological treatment at National Institute of Mental Health.',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-678-9012', email: 'tharindu.d@healthsync.lk',
    languages: ['English', 'Sinhala'],
    education: ['University of Peradeniya - MBBS, MD', 'National Institute of Mental Health - Psychiatry Residency'],
  },
  '7': {
    firstName: 'Sachini', lastName: 'Bandara', specialization: 'Ophthalmology',
    qualification: 'MBBS, MS - University of Jaffna', experience: 14,
    consultationFee: 4800, rating: 4.7, totalReviews: 213,
    bio: 'Ophthalmologist specializing in cataract surgery, LASIK, and retinal diseases at Eye Hospital Colombo.',
    profileImage: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-789-0123', email: 'sachini.b@healthsync.lk',
    languages: ['English', 'Tamil', 'Sinhala'],
    education: ['University of Jaffna - MBBS', 'Eye Hospital Colombo - Ophthalmology Residency'],
  },
  '8': {
    firstName: 'Chaminda', lastName: 'Rathnayake', specialization: 'General Medicine',
    qualification: 'MBBS, MD - University of Ruhuna', experience: 20,
    consultationFee: 3000, rating: 4.8, totalReviews: 524,
    bio: 'Experienced internal medicine physician providing comprehensive primary care at Teaching Hospital Karapitiya. Expert in managing chronic conditions.',
    profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop&crop=face',
    phone: '+94-77-890-1234', email: 'chaminda.r@healthsync.lk',
    languages: ['English', 'Sinhala'],
    education: ['University of Ruhuna - MBBS', 'Teaching Hospital Karapitiya - Internal Medicine Residency'],
  },
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
  '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
]

export default function DoctorDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [doctor, setDoctor] = useState(doctorData[id] || null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await doctorsAPI.getById(id)
        if (data) setDoctor(data)
      } catch {
        // Use fallback mock data
      } finally {
        setLoading(false)
      }
    }
    fetchDoctor()
  }, [id])

  if (loading && !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-400/30 rounded-full animate-spin border-t-primary-500" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Doctor not found</h2>
          <Link to="/doctors" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Doctors
          </Link>
        </div>
      </div>
    )
  }

  const handleBooking = async (withPayment = false) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time slot')
      return
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setBooking(true)
    try {
      const { data: appointment } = await appointmentsAPI.create({
        doctorId: doctor.id || id,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        patientId: user.id,
        patientName: user.name,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: `Consultation with Dr. ${doctor.lastName}`,
        specialization: doctor.specialization,
      })

      if (withPayment) {
        const { data: payment } = await paymentsAPI.checkout({
          appointmentId: appointment.id || appointment._id,
          doctorId: doctor.id || id,
          doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          amount: doctor.consultationFee || 3000,
        })
        if (payment.url) {
          window.location.href = payment.url
          return
        }
      }

      navigate('/appointments')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to book appointment')
    } finally {
      setBooking(false)
    }
  }

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link to="/doctors" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Doctors
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Doctor info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700">
                <div className="absolute inset-0">
                  <img
                    src={doctor.coverImage || "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&h=300&fit=crop"}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ opacity: doctor.coverImage ? 1 : 0.2 }}
                  />
                </div>
              </div>
              <div className="relative px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6">
                  <img
                    src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.firstName + ' ' + doctor.lastName)}&background=0ea5e9&color=fff&size=200`}
                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                    className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                  />
                  <div className="sm:ml-6 mt-4 sm:mt-0 sm:mb-2">
                    <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-slate-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h1>
                    <p className="text-primary-600 font-semibold">{doctor.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{doctor.rating}/5</p>
                      <p className="text-xs text-slate-400">{doctor.totalReviews} reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{doctor.experience} years</p>
                      <p className="text-xs text-slate-400">Experience</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-accent-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Rs. {doctor.consultationFee?.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Per visit</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-accent-500" />
                    <div>
                      <p className="text-sm font-bold text-accent-600">Available</p>
                      <p className="text-xs text-slate-400">Booking open</p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{doctor.bio}</p>
              </div>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary-500" />
                Education & Training
              </h2>
              <div className="space-y-3">
                {(doctor.education || [doctor.qualification]).filter(Boolean).map((edu, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary-400" />
                    <p className="text-slate-600 text-sm">{edu}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50">
                  <Phone className="w-5 h-5 text-primary-500" />
                  <span className="text-sm text-slate-600">{doctor.phone}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50">
                  <Mail className="w-5 h-5 text-primary-500" />
                  <span className="text-sm text-slate-600">{doctor.email}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">Languages:</span> {(doctor.languages || ['English']).join(', ')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right - Booking panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-28"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Book Appointment
              </h2>

              {/* Date selection */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-700 mb-3 block">Select Date</label>
                <div className="grid grid-cols-2 gap-2">
                  {dates.map((date) => {
                    const d = new Date(date)
                    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          selectedDate === date
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time selection */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-700 mb-3 block">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-6">
                <span className="text-sm text-slate-600">Consultation Fee</span>
                <span className="text-lg font-bold text-slate-800">Rs. {doctor.consultationFee?.toLocaleString()}</span>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleBooking(true)}
                  disabled={booking}
                  className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {booking ? 'Processing...' : 'Pay Now & Book'}
                </button>
                <button
                  onClick={() => handleBooking(false)}
                  disabled={booking}
                  className="w-full py-3.5 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {booking ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center mt-3">
                Free cancellation up to 24 hours before
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

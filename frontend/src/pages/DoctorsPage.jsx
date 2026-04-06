import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Star, MapPin, Clock, ArrowRight, Stethoscope } from 'lucide-react'
import { doctorsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const allDoctors = [
  {
    id: '1',
    firstName: 'Kamal', lastName: 'Perera',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD - University of Colombo',
    experience: 15, consultationFee: 5000, rating: 4.9, totalReviews: 328,
    bio: 'Board-certified cardiologist with 15+ years of experience at National Hospital Colombo.',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
  {
    id: '2',
    firstName: 'Nishani', lastName: 'Fernando',
    specialization: 'Neurology',
    qualification: 'MBBS, MD - University of Peradeniya',
    experience: 12, consultationFee: 6000, rating: 4.8, totalReviews: 256,
    bio: 'Neurologist specializing in movement disorders and neurodegenerative diseases.',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
  {
    id: '3',
    firstName: 'Amaya', lastName: 'Wickramasinghe',
    specialization: 'Pediatrics',
    qualification: 'MBBS, DCH - University of Kelaniya',
    experience: 10, consultationFee: 3500, rating: 4.9, totalReviews: 412,
    bio: 'Compassionate pediatrician dedicated to comprehensive healthcare for children.',
    profileImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
  {
    id: '4',
    firstName: 'Ruwan', lastName: 'Jayawardena',
    specialization: 'Orthopedics',
    qualification: 'MBBS, MS - University of Sri Jayewardenepura',
    experience: 18, consultationFee: 5500, rating: 4.7, totalReviews: 289,
    bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement.',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
  {
    id: '5',
    firstName: 'Dilani', lastName: 'Silva',
    specialization: 'Dermatology',
    qualification: 'MBBS, MD - University of Colombo',
    experience: 8, consultationFee: 4500, rating: 4.8, totalReviews: 195,
    bio: 'Dermatologist with expertise in medical and cosmetic dermatology.',
    profileImage: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
  {
    id: '6',
    firstName: 'Tharindu', lastName: 'Dissanayake',
    specialization: 'Psychiatry',
    qualification: 'MBBS, MD - University of Peradeniya',
    experience: 11, consultationFee: 4000, rating: 4.9, totalReviews: 367,
    bio: 'Psychiatrist focused on mood disorders, anxiety, and PTSD treatment.',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
  {
    id: '7',
    firstName: 'Sachini', lastName: 'Bandara',
    specialization: 'Ophthalmology',
    qualification: 'MBBS, MS - University of Jaffna',
    experience: 14, consultationFee: 4800, rating: 4.7, totalReviews: 213,
    bio: 'Ophthalmologist specializing in cataract surgery, LASIK, and retinal diseases.',
    profileImage: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
  {
    id: '8',
    firstName: 'Chaminda', lastName: 'Rathnayake',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD - University of Ruhuna',
    experience: 20, consultationFee: 3000, rating: 4.8, totalReviews: 524,
    bio: 'Experienced internal medicine physician providing comprehensive primary care.',
    profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    available: true,
  },
]

const specializations = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Ophthalmology', 'General Medicine']

export default function DoctorsPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || 'All')
  const [doctors, setDoctors] = useState(allDoctors)
  const [apiDoctors, setApiDoctors] = useState(null)
  const [apiSpecs, setApiSpecs] = useState(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await doctorsAPI.getPublic({ limit: 50 })
        const list = data?.doctors || (Array.isArray(data) ? data : [])
        if (list.length > 0) {
          setApiDoctors(list)
          setDoctors(list)
        }
      } catch {
        // Use fallback data
      }
    }
    const fetchSpecs = async () => {
      try {
        const { data } = await doctorsAPI.getSpecializations()
        if (Array.isArray(data) && data.length > 0) {
          setApiSpecs(['All', ...data])
        }
      } catch {
        // Use fallback
      }
    }
    fetchDoctors()
    fetchSpecs()
  }, [])

  useEffect(() => {
    const source = apiDoctors || allDoctors
    let filtered = source
    if (selectedSpec !== 'All') {
      filtered = filtered.filter(d => d.specialization === selectedSpec)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(d =>
        (d.firstName || '').toLowerCase().includes(q) ||
        (d.lastName || '').toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q)
      )
    }
    setDoctors(filtered)
  }, [search, selectedSpec, apiDoctors])

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&h=400&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold mb-4">Find Your Doctor</h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Browse our network of trusted healthcare professionals. Filter by specialty to find the perfect match.
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white text-slate-800 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {(apiSpecs || specializations).map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedSpec === spec
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-6">{doctors.length} doctors found</p>

        {/* Doctor Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map((doctor, i) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent((doctor.firstName || '') + ' ' + (doctor.lastName || ''))}&background=0ea5e9&color=fff&size=400`}
                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-accent-500 text-white text-xs font-semibold rounded-lg">
                      {(doctor.available || doctor.isAvailable) ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 glass rounded-lg px-2 py-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-800">{doctor.rating}</span>
                    <span className="text-xs text-slate-500">({doctor.totalReviews})</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-0.5">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-primary-600 font-medium mb-1">{doctor.specialization}</p>
                  <p className="text-xs text-slate-400 mb-3">{doctor.qualification}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {doctor.experience}y exp
                    </span>
                    <span className="font-semibold text-slate-800">Rs. {doctor.consultationFee?.toLocaleString()}</span>
                  </div>

                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all group"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {doctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  )
}

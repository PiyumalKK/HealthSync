import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Calendar, FileText, Bell, Shield, Pill, Activity,
  Video, HeartPulse, ArrowRight, CheckCircle
} from 'lucide-react'

const services = [
  {
    icon: Calendar,
    title: 'Smart Appointment Booking',
    description: 'Book appointments with top doctors in seconds. Real-time availability, instant confirmation, and automated reminders.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    color: 'from-primary-500 to-primary-600',
    features: ['Real-time slot availability', 'Instant booking confirmation', 'Easy rescheduling & cancellation'],
  },
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    description: 'Receive and manage your prescriptions digitally. Download PDFs, track medications, and never lose a prescription again.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop',
    color: 'from-accent-500 to-accent-600',
    features: ['PDF prescription downloads', 'Medication tracking', 'Prescription history archive'],
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Stay on top of your health with intelligent notifications. Appointment reminders, prescription alerts, and health tips.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
    color: 'from-health-purple to-violet-600',
    features: ['Email & SMS reminders', 'In-app notifications', 'Custom alert preferences'],
  },
  {
    icon: Shield,
    title: 'Secure Health Records',
    description: 'Your medical data is protected with enterprise-grade security. HIPAA-compliant, encrypted, and always accessible.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&h=400&fit=crop',
    color: 'from-health-teal to-cyan-600',
    features: ['End-to-end encryption', 'HIPAA compliant', 'Role-based access control'],
  },
  {
    icon: Activity,
    title: 'Health Analytics',
    description: 'Track your health journey with visual analytics. Monitor vitals, appointments, and prescription compliance over time.',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop',
    color: 'from-rose-500 to-pink-600',
    features: ['Visual health dashboard', 'Trend analysis', 'Export health reports'],
  },
  {
    icon: Pill,
    title: 'Medicine Management',
    description: 'Keep track of all your medications, dosages, and schedules. Get alerts when it\'s time for refills.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop',
    color: 'from-amber-500 to-orange-600',
    features: ['Medication reminders', 'Dosage tracking', 'Drug interaction alerts'],
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-br from-health-purple via-violet-700 to-purple-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1400&h=500&fit=crop" alt="" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 rounded-full text-sm font-semibold mb-4">
              Our Services
            </span>
            <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-6">
              Everything You Need for{' '}
              <span className="text-purple-200">Better Health</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              A comprehensive suite of healthcare services designed to make your medical journey seamless, secure, and stress-free.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-20">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 !== 0 ? 'lg:direction-rtl' : ''}`}
            >
              <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} shadow-lg mb-6`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4">{service.title}</h2>
                <p className="text-slate-500 leading-relaxed mb-6">{service.description}</p>
                <ul className="space-y-3 mb-8">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/doctors"
                  className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className={i % 2 !== 0 ? 'lg:order-1' : ''}>
                <div className="relative rounded-3xl overflow-hidden shadow-xl group">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-slate-900 mb-6">
              Ready to Experience Modern Healthcare?
            </h2>
            <p className="text-lg text-slate-500 mb-8">
              Join HealthSync today and discover a better way to manage your health.
            </p>
            <Link
              to="/doctors"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all group"
            >
              Find a Doctor Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

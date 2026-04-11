import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  ArrowRight, Calendar, FileText, Bell, Shield, Clock, Users,
  Star, ChevronRight, Activity, Stethoscope, Brain, Eye, Bone,
  Heart, Smile, Pill
} from 'lucide-react'

// Real Unsplash images for authentic look
const images = {
  hero: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
  heroDoctor: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop&crop=face',
  patient1: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  patient2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  patient3: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  patient4: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  about1: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=600&h=400&fit=crop',
  about2: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
  doctor1: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
  doctor2: 'https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=300&h=300&fit=crop&crop=face',
  doctor3: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
  doctor4: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&h=300&fit=crop&crop=face',
  lab: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop',
  hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
  ctaBackground: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=600&fit=crop',
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

const specializations = [
  { name: 'Cardiology', icon: Heart, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600', count: '12 Doctors' },
  { name: 'Neurology', icon: Brain, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', text: 'text-purple-600', count: '8 Doctors' },
  { name: 'Orthopedics', icon: Bone, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', count: '10 Doctors' },
  { name: 'Pediatrics', icon: Smile, color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50', text: 'text-sky-600', count: '15 Doctors' },
  { name: 'Ophthalmology', icon: Eye, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50', text: 'text-teal-600', count: '6 Doctors' },
  { name: 'Dermatology', icon: Activity, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-600', count: '9 Doctors' },
]

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Book appointments instantly with real-time availability. No more phone calls or waiting.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: FileText,
    title: 'E-Prescriptions',
    description: 'Receive digital prescriptions instantly after your consultation. Access them anytime.',
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss an appointment with automated email, SMS, and in-app notifications.',
    color: 'from-health-purple to-violet-600',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your health data is encrypted end-to-end. HIPAA-compliant infrastructure.',
    color: 'from-health-teal to-cyan-600',
  },
]

const testimonials = [
  {
    name: 'Sanduni Jayasuriya',
    role: 'Regular Patient',
    image: images.patient1,
    text: 'HealthSync transformed how I manage my healthcare. Booking appointments takes seconds, and having all my prescriptions in one place is incredible.',
    rating: 5,
  },
  {
    name: 'Nuwan Gunawardena',
    role: 'Heart Patient',
    image: images.patient2,
    text: 'The reminder system is a lifesaver. I never miss my cardiology appointments anymore. The digital prescriptions are so convenient.',
    rating: 5,
  },
  {
    name: 'Hasini De Silva',
    role: 'Parent',
    image: images.patient3,
    text: 'Managing appointments for my three kids used to be chaos. Now I handle everything from one dashboard. The pediatricians here are amazing.',
    rating: 5,
  },
]

const stats = [
  { value: '10K+', label: 'Happy Patients' },
  { value: '200+', label: 'Expert Doctors' },
  { value: '15+', label: 'Specializations' },
  { value: '98%', label: 'Satisfaction Rate' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <Navbar />
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center hero-gradient pt-20">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full shadow-sm border border-primary-100 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-600">Trusted by 10,000+ patients across Sri Lanka</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.1] mb-6">
                Your Health,{' '}
                <span className="gradient-text">Reimagined</span>
                {' '}& Connected
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Book trusted doctors, manage appointments, and receive digital prescriptions — all from one beautiful platform.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/doctors"
                  className="group inline-flex items-center justify-center px-7 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Find a Doctor
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="group inline-flex items-center justify-center px-7 py-4 text-base font-semibold text-slate-700 bg-white rounded-2xl shadow-md hover:shadow-lg border border-slate-200 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Our Services
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Patient avatars */}
              <motion.div variants={fadeInUp} className="flex items-center justify-center lg:justify-start mt-10 space-x-4">
                <div className="flex -space-x-3">
                  {[images.patient1, images.patient2, images.patient3, images.patient4].map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Patient"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">4.9/5 from 2,000+ reviews</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/10">
                  <img
                    src={images.heroDoctor}
                    alt="Professional healthcare doctor"
                    className="w-full h-[500px] lg:h-[600px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                </div>

                {/* Floating card 1 - Appointment */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-6 top-1/4 glass rounded-2xl p-4 shadow-xl max-w-[200px]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Next Appointment</p>
                      <p className="text-sm font-semibold text-slate-800">Today, 2:30 PM</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 2 - Stats */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -right-6 bottom-1/4 glass rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Health Score</p>
                      <p className="text-sm font-semibold text-accent-600">Excellent - 96%</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 3 - Rating */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute right-4 top-4 glass rounded-xl px-3 py-2 shadow-lg"
                >
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-slate-800">4.9</span>
                    <span className="text-xs text-slate-500">(328)</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="relative -mt-8 z-10 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-display font-extrabold gradient-text mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ==================== SPECIALIZATIONS ==================== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
              Specializations
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-display font-extrabold text-slate-900 mb-4">
              Find Care by Specialty
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              Browse our wide range of medical specializations and find the right expert for your needs.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {specializations.map((spec, i) => (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="card-hover"
              >
                <Link
                  to={`/doctors?specialization=${spec.name}`}
                  className={`block ${spec.bg} rounded-2xl p-6 lg:p-8 border border-transparent hover:border-slate-200 transition-all group`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${spec.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <spec.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{spec.name}</h3>
                  <p className={`text-sm font-medium ${spec.text}`}>{spec.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image collage */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.about1} alt="Medical consultation" className="w-full h-48 object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.lab} alt="Modern laboratory" className="w-full h-64 object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.about2} alt="Healthcare technology" className="w-full h-64 object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.hospital} alt="Hospital facility" className="w-full h-48 object-cover" />
                  </div>
                </div>
              </div>
              {/* Overlay floating element */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Stethoscope className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* Right - Features */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
                Why HealthSync
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-display font-extrabold text-slate-900 mb-6">
                Healthcare Made{' '}
                <span className="gradient-text">Simple</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-slate-500 mb-10">
                We combine cutting-edge technology with compassionate care to deliver an unmatched healthcare experience.
              </motion.p>

              <div className="space-y-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/80 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{feature.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== TOP DOCTORS ==================== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16"
          >
            <div>
              <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-accent-50 text-accent-600 rounded-full text-sm font-semibold mb-4">
                Our Experts
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-display font-extrabold text-slate-900 mb-4">
                Meet Our Top Doctors
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-xl">
                Highly qualified and experienced healthcare professionals committed to your wellbeing.
              </motion.p>
            </div>
            <motion.div variants={fadeInUp}>
              <Link
                to="/doctors"
                className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 group mt-4 lg:mt-0"
              >
                View All Doctors
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Dr. Nishani Fernando', spec: 'Neurology', exp: '12 years', rating: 4.8, reviews: 256, img: images.doctor1 },
              { name: 'Dr. Amaya Wickramasinghe', spec: 'Pediatrics', exp: '10 years', rating: 4.9, reviews: 412, img: images.doctor2 },
              { name: 'Dr. Ruwan Jayawardena', spec: 'Orthopedics', exp: '18 years', rating: 4.7, reviews: 289, img: images.doctor3 },
              { name: 'Dr. Dilani Silva', spec: 'Dermatology', exp: '8 years', rating: 4.8, reviews: 195, img: images.doctor4 },
            ].map((doctor, i) => (
              <motion.div
                key={doctor.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-slate-100 transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={doctor.img}
                      alt={doctor.name}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center space-x-1 glass rounded-lg px-2 py-1 w-fit">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-slate-800">{doctor.rating}</span>
                        <span className="text-xs text-slate-500">({doctor.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{doctor.name}</h3>
                    <p className="text-sm text-primary-600 font-medium mb-1">{doctor.spec}</p>
                    <p className="text-xs text-slate-400">{doctor.exp} experience</p>
                    <Link
                      to="/doctors"
                      className="mt-4 w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
                    >
                      Book Appointment
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-health-teal/10 text-health-teal rounded-full text-sm font-semibold mb-4">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-display font-extrabold text-slate-900 mb-4">
              Three Simple Steps
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              Getting started with HealthSync is quick and easy. Here's how it works.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Search & Choose',
                desc: 'Browse through our verified doctors by specialization, location, or availability. Read reviews and compare profiles.',
                image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=350&fit=crop',
                color: 'from-primary-500 to-primary-600',
              },
              {
                step: '02',
                title: 'Book Instantly',
                desc: 'Select your preferred date and time slot. Get instant confirmation with all details sent to your email.',
                image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=500&h=350&fit=crop',
                color: 'from-accent-500 to-accent-600',
              },
              {
                step: '03',
                title: 'Get Care',
                desc: 'Visit your doctor and receive a digital prescription. Track your health records and set follow-up reminders.',
                image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&h=350&fit=crop',
                color: 'from-health-teal to-cyan-600',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-slate-100 transition-all duration-300 card-hover">
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {item.step}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-display font-extrabold text-slate-900 mb-4">
              What Patients Say
            </motion.h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover"
              >
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 h-full">
                  <div className="flex items-center mb-3">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                  <div className="flex items-center space-x-3">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={images.ctaBackground} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/85 to-slate-900/90" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-5xl font-display font-extrabold text-white mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Join thousands of patients who trust HealthSync for their healthcare needs. 
              Book your first appointment today — it's free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/doctors"
                className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-900 bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

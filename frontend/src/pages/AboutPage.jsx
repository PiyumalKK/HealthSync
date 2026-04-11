import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Target, Eye, Users, Award, ArrowRight, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const team = [
  {
    name: 'Dr. Kamal Perera',
    role: 'Chief Medical Officer',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    bio: '20+ years in healthcare leadership',
  },
  {
    name: 'Dinesh Rajapaksha',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Health-tech visionary & entrepreneur',
  },
  {
    name: 'Dr. Amaya Wickramasinghe',
    role: 'Head of Patient Care',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    bio: 'Passionate about patient experience',
  },
  {
    name: 'Sahan Gunawardena',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: 'Building secure health platforms',
  },
]

const values = [
  { icon: Heart, title: 'Patient First', desc: 'Every decision we make starts with what\'s best for our patients.' },
  { icon: Target, title: 'Innovation', desc: 'We leverage cutting-edge technology to improve healthcare outcomes.' },
  { icon: Eye, title: 'Transparency', desc: 'Clear pricing, honest communication, and open processes.' },
  { icon: Users, title: 'Accessibility', desc: 'Quality healthcare should be available to everyone, everywhere.' },
]

const milestones = [
  { year: '2022', title: 'Founded', desc: 'HealthSync was born from a vision to modernize healthcare access.' },
  { year: '2023', title: '10,000 Patients', desc: 'Reached our first major milestone of 10,000 registered patients.' },
  { year: '2024', title: 'AI Integration', desc: 'Launched AI-powered health analytics and smart scheduling.' },
  { year: '2025', title: '100+ Doctors', desc: 'Expanded our network to over 100 verified healthcare specialists.' },
  { year: '2026', title: '10,000+ Patients', desc: 'Serving over 10,000 patients across Sri Lanka.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />
      {/* Hero */}
      <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&h=600&fit=crop"
            alt="Modern hospital"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-semibold mb-6">About HealthSync</span>
              <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-6 leading-tight">
                Transforming Healthcare,{' '}
                <span className="text-primary-400">One Connection</span> at a Time
              </h1>
              <p className="text-lg text-white/60 leading-relaxed">
                We're building the future of healthcare — a world where booking a doctor is as easy as booking a ride, 
                and your health records travel with you everywhere.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=500&fit=crop"
                  alt="Medical facility"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=500&fit=crop"
                  alt="Healthcare tech"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover mt-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=500&fit=crop"
                  alt="Laboratory"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=500&fit=crop"
                  alt="Patient care"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover mt-8"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">Our Story</span>
              <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-slate-900 mb-6">
                Born from a Simple Belief
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                HealthSync was founded in 2022 with a clear mission: make quality healthcare accessible to everyone through technology. 
                We noticed that despite advances in medicine, the process of finding doctors, booking appointments, and managing prescriptions 
                remained frustratingly analog.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8">
                Today, we serve over 10,000 patients across multiple cities, connecting them with 200+ verified healthcare professionals. 
                Our platform processes thousands of appointments monthly and has issued over 25,000 digital prescriptions.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-2xl">
                  <div className="text-2xl font-display font-extrabold text-primary-600">10K+</div>
                  <p className="text-xs text-slate-500 mt-1">Patients</p>
                </div>
                <div className="text-center p-4 bg-accent-50 rounded-2xl">
                  <div className="text-2xl font-display font-extrabold text-accent-600">200+</div>
                  <p className="text-xs text-slate-500 mt-1">Doctors</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl">
                  <div className="text-2xl font-display font-extrabold text-purple-600">98%</div>
                  <p className="text-xs text-slate-500 mt-1">Satisfaction</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-accent-50 text-accent-600 rounded-full text-sm font-semibold mb-4">Core Values</span>
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-slate-900">What We Stand For</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <v.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold mb-4">Leadership</span>
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-slate-900">Meet Our Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300">
                  <div className="overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
                    <p className="text-sm text-primary-600 font-medium mb-1">{member.role}</p>
                    <p className="text-xs text-slate-400">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-semibold mb-4">Our Journey</span>
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-slate-900">Milestones</h2>
          </div>
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start space-x-6"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {m.year}
                </div>
                <div className="flex-1 pb-8 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{m.title}</h3>
                  <p className="text-sm text-slate-500">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

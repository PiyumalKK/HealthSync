import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle } from 'lucide-react'

const faqs = [
  { q: 'How do I book an appointment?', a: 'Simply browse our doctors page, select a doctor, choose your preferred date and time slot, and confirm your booking. You\'ll receive an instant confirmation.' },
  { q: 'Can I cancel or reschedule?', a: 'Yes! You can cancel or reschedule your appointment up to 24 hours before the scheduled time at no charge through your appointments dashboard.' },
  { q: 'Are the doctors verified?', a: 'All doctors on HealthSync are thoroughly verified. We check their medical licenses, qualifications, and credentials before they join our platform.' },
  { q: 'How do digital prescriptions work?', a: 'After your consultation, your doctor will issue a digital prescription through HealthSync. You can view it in your dashboard, download as PDF, or share it directly with your pharmacy.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade encryption and are HIPAA compliant. Your health data is never shared without your explicit consent.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1400&h=500&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-semibold mb-4">Get in Touch</span>
            <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-4">Contact Us</h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Have a question or need help? We're here for you. Reach out and we'll respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-8">Get In Touch</h2>

            {[
              { icon: Mail, label: 'Email', value: 'support@healthsync.lk', sub: 'We reply within 24 hours' },
              { icon: Phone, label: 'Phone', value: '+94 11 234 5678', sub: 'Mon-Fri, 8am-6pm IST' },
              { icon: MapPin, label: 'Office', value: 'No. 25, Hospital Road', sub: 'Colombo 08, Sri Lanka' },
              { icon: Clock, label: 'Hours', value: 'Mon - Fri: 8am - 6pm', sub: 'Weekend: Emergency only' },
            ].map((info) => (
              <div key={info.label} className="flex items-start space-x-4 p-4 bg-white rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{info.value}</p>
                  <p className="text-xs text-slate-400">{info.sub}</p>
                </div>
              </div>
            ))}

            {/* Map image */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop"
                alt="Office location"
                className="w-full h-48 object-cover"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-2">Send a Message</h2>
              <p className="text-sm text-slate-500 mb-8">Fill out the form and we'll get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Kamal Perera"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="kamal@healthsync.lk"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div className="mt-10">
              <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-6 flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-primary-500" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
                      <span className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-6 pb-4"
                      >
                        <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

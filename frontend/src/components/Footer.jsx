import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const footerLinks = {
  Services: [
    { name: 'Find Doctors', path: '/doctors' },
    { name: 'Book Appointment', path: '/appointments' },
    { name: 'E-Prescriptions', path: '/services' },
    { name: 'Health Records', path: '/services' },
  ],
  Company: [
    { name: 'About Us', path: '/about' },
    { name: 'Our Team', path: '/about' },
    { name: 'Careers', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ],
  Support: [
    { name: 'Help Center', path: '/contact' },
    { name: 'Privacy Policy', path: '/about' },
    { name: 'Terms of Service', path: '/about' },
    { name: 'FAQ', path: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                Health<span className="text-primary-400">Sync</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Modern healthcare platform connecting patients with trusted doctors. 
              Book appointments, manage prescriptions, and take control of your health journey.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>support@healthsync.lk</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>Colombo 08, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Stay Updated</h3>
              <p className="text-sm text-slate-400">Get health tips and platform updates delivered to your inbox.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 HealthSync. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="text-slate-500 hover:text-primary-400 transition-colors text-sm">Privacy</Link>
            <Link to="/about" className="text-slate-500 hover:text-primary-400 transition-colors text-sm">Terms</Link>
            <Link to="/contact" className="text-slate-500 hover:text-primary-400 transition-colors text-sm">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { paymentsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const cancelled = searchParams.get('cancelled')
  const [status, setStatus] = useState(cancelled ? 'cancelled' : 'loading')
  const [payment, setPayment] = useState(null)

  useEffect(() => {
    if (!sessionId || cancelled) return
    const verify = async () => {
      try {
        const { data } = await paymentsAPI.verify(sessionId)
        setPayment(data.payment)
        setStatus(data.payment?.status === 'completed' ? 'success' : 'pending')
      } catch {
        setStatus('error')
      }
    }
    verify()
  }, [sessionId, cancelled])

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Verifying Payment...</h2>
              <p className="text-slate-500">Please wait while we confirm your payment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-accent-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
              <p className="text-slate-500 mb-6">
                Your payment of <span className="font-semibold text-slate-700">Rs. {payment?.amount?.toLocaleString()}</span> has been confirmed.
              </p>
              <div className="space-y-3">
                <Link
                  to="/appointments"
                  className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg transition-all"
                >
                  View My Appointments
                </Link>
                <Link
                  to="/dashboard"
                  className="block w-full py-3 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all"
                >
                  Go to Dashboard
                </Link>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Processing</h2>
              <p className="text-slate-500 mb-6">Your payment is still being processed. You will receive a confirmation shortly.</p>
              <Link
                to="/appointments"
                className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg transition-all"
              >
                View My Appointments
              </Link>
            </>
          )}

          {status === 'cancelled' && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Cancelled</h2>
              <p className="text-slate-500 mb-6">Your payment was cancelled. Your appointment is still booked — you can pay later.</p>
              <div className="space-y-3">
                <Link
                  to="/appointments"
                  className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg transition-all"
                >
                  View My Appointments
                </Link>
                <Link
                  to="/doctors"
                  className="block w-full py-3 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all"
                >
                  Browse Doctors
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
              <p className="text-slate-500 mb-6">We couldn't verify your payment. Please contact support if you were charged.</p>
              <Link
                to="/appointments"
                className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg transition-all"
              >
                View My Appointments
              </Link>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

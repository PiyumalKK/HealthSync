import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import DoctorsPage from './pages/DoctorsPage'
import DoctorDetailPage from './pages/DoctorDetailPage'
import AppointmentsPage from './pages/AppointmentsPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import DoctorDashboardPage from './pages/DoctorDashboardPage'
import DoctorRegisterPage from './pages/DoctorRegisterPage'
import PrescriptionCreatePage from './pages/PrescriptionCreatePage'
import DoctorAvailabilityPage from './pages/DoctorAvailabilityPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com'

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ErrorBoundary>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: { iconTheme: { primary: '#06b6d4', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - Patient */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute><AppointmentsPage /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><NotificationsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/register" element={
            <ProtectedRoute><DoctorRegisterPage /></ProtectedRoute>
          } />
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute requiredRole="doctor"><DoctorDashboardPage /></ProtectedRoute>
          } />
          <Route path="/doctor/prescriptions/new" element={
            <ProtectedRoute requiredRole="doctor"><PrescriptionCreatePage /></ProtectedRoute>
          } />
          <Route path="/doctor/availability" element={
            <ProtectedRoute requiredRole="doctor"><DoctorAvailabilityPage /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>
          } />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App

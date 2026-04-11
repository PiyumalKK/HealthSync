import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, prescriptionsAPI, notificationsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Mock health data for charts
const healthTrendData = [
  { month: 'Jan', heartRate: 72, bloodPressure: 118, weight: 165 },
  { month: 'Feb', heartRate: 74, bloodPressure: 120, weight: 163 },
  { month: 'Mar', heartRate: 70, bloodPressure: 115, weight: 161 },
  { month: 'Apr', heartRate: 68, bloodPressure: 112, weight: 160 },
  { month: 'May', heartRate: 71, bloodPressure: 117, weight: 158 },
  { month: 'Jun', heartRate: 69, bloodPressure: 114, weight: 157 },
];

const activityData = [
  { day: 'Mon', steps: 8200, calories: 2100 },
  { day: 'Tue', steps: 10400, calories: 2300 },
  { day: 'Wed', steps: 7800, calories: 1900 },
  { day: 'Thu', steps: 11000, calories: 2500 },
  { day: 'Fri', steps: 9200, calories: 2200 },
  { day: 'Sat', steps: 6500, calories: 1800 },
  { day: 'Sun', steps: 5200, calories: 1600 },
];

const appointmentTypeData = [
  { name: 'Check-up', value: 35, color: '#06b6d4' },
  { name: 'Follow-up', value: 25, color: '#3b82f6' },
  { name: 'Emergency', value: 10, color: '#ef4444' },
  { name: 'Consultation', value: 30, color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ title, value, change, icon, color, delay }) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all group"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <svg className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
            <span className="text-white/30 text-xs">vs last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function AppointmentCard({ appointment, index }) {
  const statusColors = {
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all"
    >
      <img
        src={appointment.doctorImage}
        alt={appointment.doctorName}
        className="w-12 h-12 rounded-xl object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{appointment.doctorName}</p>
        <p className="text-white/40 text-sm">{appointment.specialty}</p>
      </div>
      <div className="text-right">
        <p className="text-white/80 text-sm font-medium">{appointment.date}</p>
        <p className="text-white/40 text-xs">{appointment.time}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[appointment.status] || statusColors.pending}`}>
        {appointment.status}
      </span>
    </motion.div>
  );
}

function PrescriptionCard({ prescription, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">{prescription.medication}</p>
            <p className="text-white/40 text-xs">{prescription.dosage}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          prescription.active
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {prescription.active ? 'Active' : 'Completed'}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-white/30">
        <span>Dr. {prescription.doctor}</span>
        <span>{prescription.refills} refills left</span>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, rxRes, notifRes] = await Promise.allSettled([
          appointmentsAPI.getAll(),
          prescriptionsAPI.getAll(),
          notificationsAPI.getAll(),
        ]);

        if (apptRes.status === 'fulfilled') setAppointments(apptRes.value.data?.appointments?.slice(0, 5) || []);
        if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value.data?.prescriptions?.slice(0, 5) || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.notifications?.slice(0, 5) || []);
      } catch {
        // Use mock data fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fallback data for demo
  const mockAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Kamal Perera',
      doctorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80',
      specialty: 'Cardiologist',
      date: 'Dec 28, 2024',
      time: '10:00 AM',
      status: 'confirmed',
    },
    {
      id: 2,
      doctorName: 'Dr. Nishani Fernando',
      doctorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80',
      specialty: 'Neurologist',
      date: 'Dec 30, 2024',
      time: '2:30 PM',
      status: 'upcoming',
    },
    {
      id: 3,
      doctorName: 'Dr. Dilani Silva',
      doctorImage: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&q=80',
      specialty: 'Dermatologist',
      date: 'Jan 3, 2025',
      time: '11:00 AM',
      status: 'pending',
    },
    {
      id: 4,
      doctorName: 'Dr. Ruwan Jayawardena',
      doctorImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80',
      specialty: 'Orthopedic',
      date: 'Jan 5, 2025',
      time: '9:00 AM',
      status: 'upcoming',
    },
  ];

  const mockPrescriptions = [
    { id: 1, medication: 'Metformin 500mg', dosage: 'Twice daily with meals', doctor: 'Kamal Perera', refills: 3, active: true },
    { id: 2, medication: 'Lisinopril 10mg', dosage: 'Once daily, morning', doctor: 'Nishani Fernando', refills: 5, active: true },
    { id: 3, medication: 'Atorvastatin 20mg', dosage: 'Once daily, evening', doctor: 'Kamal Perera', refills: 2, active: true },
    { id: 4, medication: 'Amoxicillin 250mg', dosage: 'Three times daily', doctor: 'Dilani Silva', refills: 0, active: false },
  ];

  const displayAppointments = appointments;
  const displayPrescriptions = prescriptions;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'health', label: 'Health Analytics', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'appointments', label: 'Appointments', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'prescriptions', label: 'Prescriptions', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-10"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {greeting()}, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Patient'}</span>
              </h1>
              <p className="text-white/50 mt-2">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Link
                to="/appointments"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all text-sm"
              >
                + Book Appointment
              </Link>
              <button className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{notifications.length || ''}</span>
              </button>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <StatCard
                    title="Upcoming Appointments"
                    value="4"
                    change={12}
                    delay={0.1}
                    color="bg-cyan-500"
                    icon={<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  />
                  <StatCard
                    title="Active Prescriptions"
                    value="3"
                    change={-5}
                    delay={0.2}
                    color="bg-purple-500"
                    icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  />
                  <StatCard
                    title="Health Score"
                    value="87"
                    change={8}
                    delay={0.3}
                    color="bg-green-500"
                    icon={<svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                  />
                  <StatCard
                    title="Unread Notifications"
                    value="7"
                    change={15}
                    delay={0.4}
                    color="bg-orange-500"
                    icon={<svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                  />
                </div>

                {/* Quick Actions + Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Health Trends</h3>
                      <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-sm focus:outline-none">
                        <option>Last 6 months</option>
                        <option>Last year</option>
                      </select>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={healthTrendData}>
                        <defs>
                          <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#06b6d4" fill="url(#heartGrad)" strokeWidth={2} />
                        <Area type="monotone" dataKey="bloodPressure" name="Blood Pressure" stroke="#8b5cf6" fill="url(#bpGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Appointment Types */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-6">Visit Types</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={appointmentTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {appointmentTypeData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {appointmentTypeData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-xs text-white/50">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Appointments + Prescriptions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Appointments */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Upcoming Appointments</h3>
                      <Link to="/appointments" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        View all →
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {displayAppointments.map((appt, i) => (
                        <AppointmentCard key={appt.id || i} appointment={appt} index={i} />
                      ))}
                    </div>
                  </motion.div>

                  {/* Active Prescriptions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Active Prescriptions</h3>
                      <Link to="/prescriptions" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        View all →
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {displayPrescriptions.map((rx, i) => (
                        <PrescriptionCard key={rx.id || i} prescription={rx} index={i} />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Health Analytics Tab */}
            {activeTab === 'health' && (
              <motion.div
                key="health"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Vitals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  {[
                    { label: 'Heart Rate', value: '72 bpm', icon: '❤️', trend: 'Normal', color: 'text-green-400' },
                    { label: 'Blood Pressure', value: '118/76', icon: '🩺', trend: 'Optimal', color: 'text-green-400' },
                    { label: 'Blood Sugar', value: '95 mg/dL', icon: '🩸', trend: 'Normal', color: 'text-green-400' },
                    { label: 'BMI', value: '23.4', icon: '⚖️', trend: 'Healthy', color: 'text-green-400' },
                  ].map((vital, i) => (
                    <motion.div
                      key={vital.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center"
                    >
                      <span className="text-3xl">{vital.icon}</span>
                      <p className="text-white/50 text-sm mt-3">{vital.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{vital.value}</p>
                      <p className={`text-xs font-medium mt-2 ${vital.color}`}>{vital.trend}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Activity Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="steps" name="Steps" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-6">Calorie Intake</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="calories" name="Calories" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Health Score Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Health Score Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Cardiovascular', score: 92, color: 'from-green-500 to-emerald-500' },
                      { label: 'Metabolic', score: 85, color: 'from-cyan-500 to-blue-500' },
                      { label: 'Physical Activity', score: 78, color: 'from-blue-500 to-indigo-500' },
                      { label: 'Sleep Quality', score: 88, color: 'from-purple-500 to-violet-500' },
                      { label: 'Mental Wellness', score: 91, color: 'from-pink-500 to-rose-500' },
                    ].map((item, i) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <span className="text-white/60 text-sm w-36">{item.label}</span>
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                          />
                        </div>
                        <span className="text-white font-semibold text-sm w-10 text-right">{item.score}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <motion.div
                key="appts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">All Appointments</h3>
                    <Link
                      to="/appointments"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                      + New Appointment
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {displayAppointments.map((appt, i) => (
                      <AppointmentCard key={appt.id || i} appointment={appt} index={i} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <motion.div
                key="rx"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">All Prescriptions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayPrescriptions.map((rx, i) => (
                      <PrescriptionCard key={rx.id || i} prescription={rx} index={i} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

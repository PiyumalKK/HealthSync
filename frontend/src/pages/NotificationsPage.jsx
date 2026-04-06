import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { notificationsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const notificationIcons = {
  appointment: (
    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  ),
  prescription: (
    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  ),
  alert: (
    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
  system: (
    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
  payment: (
    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    </div>
  ),
  reminder: (
    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
  ),
};

const mockNotifications = [
  {
    id: 1,
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Kamal Perera on Dec 28 at 10:00 AM has been confirmed.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actionUrl: '/appointments',
  },
  {
    id: 2,
    type: 'prescription',
    title: 'Prescription Ready',
    message: 'Your prescription for Metformin 500mg has been renewed by Dr. Nishani Fernando. You have 3 refills remaining.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    actionUrl: '/dashboard',
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Medication Reminder',
    message: 'Time to take your evening dose of Atorvastatin 20mg.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: false,
    actionUrl: null,
  },
  {
    id: 4,
    type: 'system',
    title: 'Lab Results Available',
    message: 'Your blood work results from Dec 20 are now available. Click to view your complete report.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    actionUrl: '/dashboard',
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Processed',
    message: 'Payment of Rs. 5,000 for consultation with Dr. Dilani Silva has been successfully processed.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
    actionUrl: null,
  },
  {
    id: 6,
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'Reminder: You have an appointment with Dr. Nishani Fernando tomorrow at 2:30 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
    actionUrl: '/appointments',
  },
  {
    id: 7,
    type: 'alert',
    title: 'Health Alert',
    message: 'Your blood pressure readings have been slightly elevated this week. Consider scheduling a check-up.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    read: true,
    actionUrl: '/doctors',
  },
  {
    id: 8,
    type: 'system',
    title: 'Profile Update',
    message: 'Your insurance information has been verified and updated successfully.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    read: true,
    actionUrl: '/profile',
  },
  {
    id: 9,
    type: 'prescription',
    title: 'Refill Reminder',
    message: 'Your Lisinopril 10mg prescription has only 1 refill remaining. Contact your doctor for renewal.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    read: true,
    actionUrl: '/dashboard',
  },
  {
    id: 10,
    type: 'reminder',
    title: 'Annual Check-up Due',
    message: 'Your annual health check-up is overdue. Schedule an appointment today to stay on top of your health.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    read: true,
    actionUrl: '/appointments',
  },
];

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'appointment', label: 'Appointments' },
  { id: 'prescription', label: 'Prescriptions' },
  { id: 'alert', label: 'Alerts' },
  { id: 'system', label: 'System' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationsAPI.getAll();
        const list = data?.notifications || (Array.isArray(data) ? data : []);
        if (list.length > 0) {
          setNotifications(list.map(n => ({
            ...n,
            read: n.read ?? n.status === 'read',
            timestamp: n.timestamp ? new Date(n.timestamp) : new Date(n.createdAt),
          })));
        }
      } catch {
        // Use mock data
      }
    };
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter !== 'all') return n.type === filter;
    return true;
  }).filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await notificationsAPI.markRead(id); } catch { /* ignore */ }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-semibold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-white/50 mt-1">Stay updated with your health activities</p>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {unreadCount > 0 && (
                <motion.button
                  onClick={markAllRead}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm hover:bg-white/10 transition-all"
                >
                  Mark all read
                </motion.button>
              )}
              {notifications.length > 0 && (
                <motion.button
                  onClick={clearAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm hover:bg-red-500/20 transition-all"
                >
                  Clear all
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Search + Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    filter === option.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                  {option.id === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-cyan-500/30 rounded text-[10px]">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Notification List */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white/60 mb-2">No notifications</h3>
                  <p className="text-white/30">You&apos;re all caught up!</p>
                </motion.div>
              ) : (
                filteredNotifications.map((notification, i) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`relative group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                      notification.read
                        ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                        : 'bg-white/[0.05] border-cyan-500/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    )}

                    {/* Icon */}
                    {notificationIcons[notification.type] || notificationIcons.system}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className={`font-medium ${notification.read ? 'text-white/70' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-white/30 whitespace-nowrap flex-shrink-0">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${notification.read ? 'text-white/40' : 'text-white/60'}`}>
                        {notification.message}
                      </p>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          View details
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10"
                    >
                      <svg className="w-4 h-4 text-white/30 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

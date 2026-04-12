import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'preferences', label: 'Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-cyan-500' : 'bg-white/10'
      }`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

export default function ProfilePage() {
  const { user, updateUser, setUserData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage('Image must be under 5MB');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    setAvatarUploading(true);
    setSaveMessage('');
    try {
      const { data } = await authAPI.uploadAvatar(file);
      setUserData(data.user);
      setSaveMessage('Profile picture updated!');
    } catch (err) {
      setSaveMessage(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setSaveMessage('Cover image must be under 10MB');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    setCoverUploading(true);
    setSaveMessage('');
    try {
      const { data } = await authAPI.uploadCover(file);
      setUserData(data.user);
      setSaveMessage('Cover image updated!');
    } catch (err) {
      setSaveMessage(err.response?.data?.error || 'Failed to upload cover');
    } finally {
      setCoverUploading(false);
      e.target.value = '';
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    bloodGroup: user?.bloodGroup || 'O+',
    allergies: user?.allergies || '',
    insuranceId: user?.insuranceId || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    prescriptionAlerts: true,
    healthTips: false,
    promotionalEmails: false,
    labResults: true,
    paymentAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'Asia/Colombo',
    dateFormat: 'DD/MM/YYYY',
    darkMode: true,
    compactView: false,
  });

  const handleProfileSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateUser(profileData);
      setSaveMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setSaveMessage('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSaveMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setSaveMessage(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            {/* Banner */}
            <div className="h-40 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => coverInputRef.current?.click()}>
              <img
                src={user?.coverImage || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80"}
                alt="Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {coverUploading ? (
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Change Cover
                  </div>
                )}
              </div>
              <input type="file" ref={coverInputRef} accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverChange} className="hidden" />
            </div>

            {/* Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 px-6 -mt-16 relative z-10">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-800">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0ea5e9&color=fff&size=200`}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{user?.name || 'Patient'}</h1>
                <p className="text-white/50">{user?.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* Save Message */}
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                  saveMessage.includes('success')
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                    saveMessage.includes('success')
                      ? 'M5 13l4 4L19 7'
                      : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  } />
                </svg>
                <p className="text-sm">{saveMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                      <button
                        onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isEditing
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Kasun Perera' },
                        { label: 'Email', key: 'email', type: 'email', placeholder: 'kasun@example.com', disabled: true },
                        { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+94 77 123 4567' },
                        { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
                        { label: 'Blood Group', key: 'bloodGroup', type: 'text', placeholder: 'O+' },
                        { label: 'Emergency Contact', key: 'emergencyContact', type: 'tel', placeholder: '+94 77 234 5678' },
                        { label: 'Insurance ID', key: 'insuranceId', type: 'text', placeholder: 'INS-000000' },
                        { label: 'Gender', key: 'gender', type: 'text', placeholder: 'Male / Female / Other' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-white/50 mb-2">{field.label}</label>
                          <input
                            type={field.type}
                            value={profileData[field.key]}
                            onChange={(e) => setProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            disabled={!isEditing || field.disabled}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]"
                          />
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/50 mb-2">Allergies</label>
                        <textarea
                          value={profileData.allergies}
                          onChange={(e) => setProfileData(prev => ({ ...prev, allergies: e.target.value }))}
                          placeholder="List any known allergies..."
                          disabled={!isEditing}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/50 mb-2">Address</label>
                        <textarea
                          value={profileData.address}
                          onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Full address..."
                          disabled={!isEditing}
                          rows={2}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-white/40 hover:text-white/60 text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-white/50 mb-2">Current Password</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/50 mb-2">New Password</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/50 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-60"
                        >
                          {isSaving ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>

                    {/* Connected Accounts */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-semibold text-white mb-6">Connected Accounts</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3">
                            <svg className="w-8 h-8" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            <div>
                              <p className="text-white font-medium">Google</p>
                              <p className="text-white/40 text-sm">{user?.provider === 'google' ? 'Connected' : 'Not connected'}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            user?.provider === 'google'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-white/5 text-white/30'
                          }`}>
                            {user?.provider === 'google' ? 'Connected' : 'Connect'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                      <h2 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h2>
                      <p className="text-white/40 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                      <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-all">
                        Delete Account
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                    <div className="space-y-6">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your account activity' },
                        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get text messages for urgent alerts' },
                        { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Reminders before your scheduled appointments' },
                        { key: 'prescriptionAlerts', label: 'Prescription Alerts', desc: 'Alerts for prescription refills and renewals' },
                        { key: 'labResults', label: 'Lab Results', desc: 'Notifications when lab results are available' },
                        { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Notifications about payments and billing' },
                        { key: 'healthTips', label: 'Health Tips', desc: 'Personalized health tips and recommendations' },
                        { key: 'promotionalEmails', label: 'Promotional', desc: 'Marketing emails about new features and offers' },
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-white font-medium">{setting.label}</p>
                            <p className="text-white/40 text-sm">{setting.desc}</p>
                          </div>
                          <ToggleSwitch
                            enabled={notifSettings[setting.key]}
                            onChange={(val) => setNotifSettings(prev => ({ ...prev, [setting.key]: val }))}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">App Preferences</h2>
                    <div className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-white/50 mb-2">Language</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/50 mb-2">Timezone</label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                        >
                          <option value="Asia/Colombo">Sri Lanka Time (SLST)</option>
                          <option value="Asia/Kolkata">India Time (IST)</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/50 mb-2">Date Format</label>
                        <select
                          value={preferences.dateFormat}
                          onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-white font-medium">Dark Mode</p>
                          <p className="text-white/40 text-sm">Use dark theme across the app</p>
                        </div>
                        <ToggleSwitch
                          enabled={preferences.darkMode}
                          onChange={(val) => setPreferences(prev => ({ ...prev, darkMode: val }))}
                        />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-white font-medium">Compact View</p>
                          <p className="text-white/40 text-sm">Show more content in less space</p>
                        </div>
                        <ToggleSwitch
                          enabled={preferences.compactView}
                          onChange={(val) => setPreferences(prev => ({ ...prev, compactView: val }))}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

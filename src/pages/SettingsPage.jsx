import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Settings, User, Bell, Moon, Sun, Shield, Loader2,
  Save, Trash2, Volume2, Smartphone,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import { requestNotificationPermission } from '../utils/notifications'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, profile, updateProfile, logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useAppStore()
  const [isSaving, setIsSaving] = useState(false)
  const [notifPermission, setNotifPermission] = useState(Notification?.permission || 'default')

  const { register, handleSubmit } = useForm({
    defaultValues: {
      full_name: profile?.full_name || user?.user_metadata?.full_name || '',
      phone: profile?.phone || '',
      company: profile?.company || '',
    },
  })

  const onSaveProfile = async (data) => {
    setIsSaving(true)
    try {
      await updateProfile(data)
      toast.success('Profile updated!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission()
    setNotifPermission(Notification?.permission)
    if (granted) toast.success('Notifications enabled! 🔔')
    else toast.error('Permission denied')
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'account', label: 'Account', icon: Shield },
  ]

  const [activeSection, setActiveSection] = useState('profile')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <Settings size={24} className="text-brand-400" /> Settings
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="glass-card p-3 h-fit">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === id ? 'bg-brand-600/30 text-white border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
                <User size={18} className="text-brand-400" /> Profile Settings
              </h2>

              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{profile?.full_name || 'Your Name'}</p>
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                  <p className="text-xs text-brand-400 mt-0.5">Freelancer · Pro Plan</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                    <input className="input-field" placeholder="Your full name" {...register('full_name')} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                    <input className="input-field" placeholder="+91 98765 43210" {...register('phone')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Company / Freelance Name</label>
                    <input className="input-field" placeholder="Your company or freelance brand" {...register('company')} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email (Read-only)</label>
                  <input className="input-field opacity-60 cursor-not-allowed" value={user?.email} readOnly />
                </div>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Bell size={18} className="text-brand-400" /> Notification Settings
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-brand-400" />
                    <div>
                      <p className="text-white font-medium text-sm">Browser Notifications</p>
                      <p className="text-xs text-slate-400">Get alerts in your browser</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      notifPermission === 'granted' ? 'text-green-400 bg-green-500/10' :
                      notifPermission === 'denied' ? 'text-red-400 bg-red-500/10' :
                      'text-yellow-400 bg-yellow-500/10'
                    }`}>
                      {notifPermission === 'granted' ? '✓ Enabled' : notifPermission === 'denied' ? '✕ Denied' : 'Not Set'}
                    </span>
                    {notifPermission !== 'granted' && (
                      <button onClick={enableNotifications} className="btn-primary py-1.5 text-xs">
                        Enable
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} className="text-brand-400" />
                    <div>
                      <p className="text-white font-medium text-sm">Sound Alerts</p>
                      <p className="text-xs text-slate-400">Play sound when reminder fires</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">✓ Enabled</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-brand-400" />
                    <div>
                      <p className="text-white font-medium text-sm">In-App Popup</p>
                      <p className="text-xs text-slate-400">Show popup inside dashboard</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">✓ Enabled</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <p className="text-sm text-brand-300 font-medium mb-1">How reminders work:</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• App checks for due reminders every 30 seconds</li>
                  <li>• When reminder time matches, all 3 alerts fire simultaneously</li>
                  <li>• Browser must be open for notifications to work</li>
                  <li>• Test any task reminder from the Tasks page using the 🔔 button</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Moon size={18} className="text-brand-400" /> Appearance
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => !darkMode && toggleDarkMode()}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    darkMode ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Moon size={24} className={`mx-auto mb-3 ${darkMode ? 'text-brand-400' : 'text-slate-500'}`} />
                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-400'}`}>Dark Mode</p>
                  <p className="text-xs text-slate-500 mt-1">Easy on the eyes</p>
                  {darkMode && <div className="w-2 h-2 rounded-full bg-brand-400 mx-auto mt-2" />}
                </button>

                <button
                  onClick={() => darkMode && toggleDarkMode()}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    !darkMode ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Sun size={24} className={`mx-auto mb-3 ${!darkMode ? 'text-brand-400' : 'text-slate-500'}`} />
                  <p className={`font-medium text-sm ${!darkMode ? 'text-white' : 'text-slate-400'}`}>Light Mode</p>
                  <p className="text-xs text-slate-500 mt-1">Clean & bright</p>
                  {!darkMode && <div className="w-2 h-2 rounded-full bg-brand-400 mx-auto mt-2" />}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Shield size={18} className="text-brand-400" /> Account & Security
              </h2>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm font-medium text-white mb-1">Account Email</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm font-medium text-white mb-1">Account Created</p>
                <p className="text-slate-400 text-sm">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-xs text-slate-500 mb-3">Danger Zone</p>
                <button
                  onClick={async () => { await logout(); window.location.href = '/login' }}
                  className="btn-danger"
                >
                  <Trash2 size={16} /> Sign Out of All Devices
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

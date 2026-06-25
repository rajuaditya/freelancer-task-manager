import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CheckSquare, Calendar, BarChart3,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Zap, Search, Moon, Sun, Plus,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import AddQuickModal from '../ui/AddQuickModal'
import GlobalSearch from '../ui/GlobalSearch'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout() {
  const { user, profile, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar, unreadCount } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark mesh-bg' : 'light bg-slate-50'}`}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          hidden lg:flex flex-col h-full z-50 relative
          ${darkMode
            ? 'bg-slate-900/90 border-r border-white/5 backdrop-blur-xl'
            : 'bg-white border-r border-slate-200'}
        `}
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          navLinks={navLinks}
          unreadCount={unreadCount}
          darkMode={darkMode}
          initials={initials}
          displayName={displayName}
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col
              ${darkMode ? 'bg-slate-900 border-r border-white/5' : 'bg-white border-r border-slate-200'}
            `}
          >
            <SidebarContent
              collapsed={false}
              navLinks={navLinks}
              unreadCount={unreadCount}
              darkMode={darkMode}
              initials={initials}
              displayName={displayName}
              onToggle={() => setMobileOpen(false)}
              onLogout={handleLogout}
              mobile
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`
          flex-shrink-0 h-16 flex items-center justify-between px-4 lg:px-6 z-30
          ${darkMode
            ? 'bg-slate-900/50 border-b border-white/5 backdrop-blur-xl'
            : 'bg-white/80 border-b border-slate-200 backdrop-blur-xl'}
        `}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                ${darkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                transition-all duration-200 cursor-pointer
              `}
            >
              <Search size={15} />
              <span className="hidden sm:block">Search anything...</span>
              <kbd className={`hidden sm:block text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-all"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NavLink to="/notifications" className="relative p-2 rounded-xl hover:bg-white/10 text-slate-400">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowQuick(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-glow-lg flex items-center justify-center glow-purple"
      >
        <Plus size={24} />
      </motion.button>

      {showQuick && <AddQuickModal onClose={() => setShowQuick(false)} />}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
    </div>
  )
}

function SidebarContent({ collapsed, navLinks, unreadCount, darkMode, initials, displayName, onToggle, onLogout, mobile }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white font-display leading-none">TaskManager</p>
                <p className="text-[10px] text-brand-400 font-medium">Pro</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm mx-auto">
            <Zap size={16} className="text-white" />
          </div>
        )}
        {!mobile && (
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all ${collapsed ? 'mx-auto mt-2' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {mobile && (
          <button onClick={onToggle} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
          >
            <div className="relative">
              <Icon size={18} className="flex-shrink-0" />
              {badge && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Profile */}
      <div className={`p-3 border-t border-white/5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-500">Freelancer</p>
            </div>
            <button
              onClick={onLogout}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </>
  )
}

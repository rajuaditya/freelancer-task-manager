import { AnimatePresence, motion } from 'framer-motion'
import { X, Bell, ExternalLink } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useNavigate } from 'react-router-dom'

export default function NotificationPopup() {
  const { activePopup, dismissPopup } = useAppStore()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {activePopup && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-[100] w-80 glass-card border border-yellow-500/30 bg-yellow-500/5 shadow-glow-lg overflow-hidden"
        >
          {/* Animated top border */}
          <div className="h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center animate-pulse">
                  <Bell size={16} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{activePopup.title}</p>
                  <p className="text-yellow-400 text-[10px] font-medium uppercase tracking-wide">Reminder Alert</p>
                </div>
              </div>
              <button
                onClick={dismissPopup}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 mb-4 pl-1">
              {activePopup.clientName && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-12 flex-shrink-0">Client:</span>
                  <span className="text-sm text-white font-medium">{activePopup.clientName}</span>
                </div>
              )}
              {activePopup.taskTitle && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-12 flex-shrink-0">Task:</span>
                  <span className="text-sm text-slate-200 truncate">{activePopup.taskTitle}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-12 flex-shrink-0">Time:</span>
                <span className="text-sm text-brand-400 font-mono">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { navigate('/tasks'); dismissPopup() }}
                className="flex-1 btn-primary py-2 text-xs justify-center"
              >
                <ExternalLink size={12} /> View Task
              </button>
              <button
                onClick={dismissPopup}
                className="flex-1 btn-secondary py-2 text-xs justify-center"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Auto-dismiss progress bar */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 8, ease: 'linear' }}
            className="h-0.5 bg-yellow-500/50"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

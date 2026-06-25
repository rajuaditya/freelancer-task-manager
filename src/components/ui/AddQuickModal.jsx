import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, CheckSquare, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AddQuickModal({ onClose }) {
  const navigate = useNavigate()

  const options = [
    {
      icon: Users,
      label: 'Add Client',
      desc: 'Add a new client or project',
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/10',
      action: () => { navigate('/clients'); onClose() },
    },
    {
      icon: CheckSquare,
      label: 'Add Task',
      desc: 'Create a reminder or task',
      color: 'from-brand-500 to-purple-500',
      bg: 'bg-brand-500/10',
      action: () => { navigate('/tasks'); onClose() },
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm glass-card p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <p className="font-bold text-white font-display">Quick Add</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {options.map(({ icon: Icon, label, desc, color, bg, action }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action}
              className={`w-full flex items-center gap-4 p-4 rounded-xl ${bg} border border-white/10 hover:border-white/20 transition-all text-left`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

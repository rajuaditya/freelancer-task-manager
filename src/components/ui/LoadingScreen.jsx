import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-lg mx-auto mb-4"
        >
          <Zap size={32} className="text-white" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-slate-400 text-sm font-medium"
        >
          Loading Freelancer Task Manager Pro...
        </motion.p>
      </div>
    </div>
  )
}

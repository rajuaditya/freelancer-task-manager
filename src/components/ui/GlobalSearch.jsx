import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Users, CheckSquare, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { clientsApi, tasksApi } from '../../lib/api'

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => clientsApi.getAll(user.id),
    enabled: !!user,
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => tasksApi.getAll(user.id),
    enabled: !!user,
  })

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const q = query.toLowerCase().trim()
  const filteredClients = q
    ? clients.filter((c) =>
        c.client_name?.toLowerCase().includes(q) ||
        c.company_name?.toLowerCase().includes(q) ||
        c.project_name?.toLowerCase().includes(q)
      ).slice(0, 5)
    : []

  const filteredTasks = q
    ? tasks.filter((t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      ).slice(0, 5)
    : []

  const hasResults = filteredClients.length > 0 || filteredTasks.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl glass-card overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search clients, projects, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          )}
          <kbd className="text-xs text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="p-6 text-center">
              <Search size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Start typing to search...</p>
            </div>
          )}

          {query && !hasResults && (
            <div className="p-6 text-center">
              <p className="text-slate-500 text-sm">No results for "<span className="text-white">{query}</span>"</p>
            </div>
          )}

          {filteredClients.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide px-2 py-1.5 font-medium">Clients</p>
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => { navigate(`/clients/${client.id}`); onClose() }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: client.avatar_color || '#6366f1' }}>
                    {client.client_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{client.client_name}</p>
                    <p className="text-xs text-slate-400 truncate">{client.project_name || client.company_name || 'No project'}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded status-${client.project_status} flex-shrink-0`}>
                    {client.project_status?.replace('_', ' ')}
                  </span>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide px-2 py-1.5 font-medium">Tasks</p>
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => { navigate('/tasks'); onClose() }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckSquare size={14} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400 truncate">{task.clients?.client_name || 'No client'}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded priority-${task.priority} flex-shrink-0`}>
                    {task.priority}
                  </span>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {hasResults && (
          <div className="p-3 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {filteredClients.length + filteredTasks.length} results found
            </p>
            <p className="text-xs text-slate-600">↵ to select · ESC to close</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Plus, Search, CheckSquare, Edit2, Trash2, X, Loader2,
  Clock, AlertTriangle, CheckCircle2, Flag, Bell,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { tasksApi, clientsApi } from '../lib/api'
import { triggerReminder } from '../utils/notifications'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']

export default function TasksPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => tasksApi.getAll(user.id),
    enabled: !!user,
    refetchInterval: 30000,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => clientsApi.getAll(user.id),
    enabled: !!user,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] })

  const createMutation = useMutation({
    mutationFn: (data) => tasksApi.create({ ...data, user_id: user.id }),
    onSuccess: () => { invalidate(); setShowModal(false); toast.success('Task created!') },
    onError: (e) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data, user.id),
    onSuccess: () => { invalidate(); setEditTask(null); toast.success('Task updated!') },
    onError: (e) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, title }) => tasksApi.delete(id, user.id, title),
    onSuccess: () => { invalidate(); toast.success('Task deleted') },
    onError: (e) => toast.error(e.message),
  })

  const completeMutation = useMutation({
    mutationFn: (task) => tasksApi.update(task.id, { status: 'completed', completed_at: new Date().toISOString() }, user.id),
    onSuccess: () => { invalidate(); toast.success('Task completed! 🎉') },
  })

  const testReminder = (task) => {
    const client = clients.find((c) => c.id === task.client_id)
    triggerReminder(task, client?.client_name || 'Test Client')
  }

  const filtered = tasks.filter((t) => {
    const matchSearch = !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.clients?.client_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const groups = {
    urgent: filtered.filter((t) => t.priority === 'urgent' && t.status !== 'completed'),
    pending: filtered.filter((t) => t.status === 'pending' && t.priority !== 'urgent'),
    in_progress: filtered.filter((t) => t.status === 'in_progress' && t.priority !== 'urgent'),
    completed: filtered.filter((t) => t.status === 'completed'),
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <CheckSquare size={24} className="text-brand-400" /> Tasks & Reminders
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{tasks.filter((t) => t.status !== 'completed').length} active tasks</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Urgent', count: groups.urgent.length, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Pending', count: groups.pending.length, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'In Progress', count: groups.in_progress.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completed', count: groups.completed.length, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card p-3 ${stat.bg} text-center`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="glass-card h-24 skeleton" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <CheckSquare size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No tasks found</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto mt-4">
            <Plus size={16} /> Create First Task
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.urgent.length > 0 && (
            <TaskGroup title="🚨 Urgent" tasks={groups.urgent} clients={clients}
              onEdit={setEditTask} onDelete={(t) => deleteMutation.mutate({ id: t.id, title: t.title })}
              onComplete={completeMutation.mutate} onTestReminder={testReminder} />
          )}
          {groups.pending.length > 0 && (
            <TaskGroup title="⏳ Pending" tasks={groups.pending} clients={clients}
              onEdit={setEditTask} onDelete={(t) => deleteMutation.mutate({ id: t.id, title: t.title })}
              onComplete={completeMutation.mutate} onTestReminder={testReminder} />
          )}
          {groups.in_progress.length > 0 && (
            <TaskGroup title="🔄 In Progress" tasks={groups.in_progress} clients={clients}
              onEdit={setEditTask} onDelete={(t) => deleteMutation.mutate({ id: t.id, title: t.title })}
              onComplete={completeMutation.mutate} onTestReminder={testReminder} />
          )}
          {groups.completed.length > 0 && (
            <TaskGroup title="✅ Completed" tasks={groups.completed} clients={clients}
              onEdit={setEditTask} onDelete={(t) => deleteMutation.mutate({ id: t.id, title: t.title })}
              onComplete={completeMutation.mutate} onTestReminder={testReminder} />
          )}
        </div>
      )}

      <AnimatePresence>
        {(showModal || editTask) && (
          <TaskModal
            task={editTask}
            clients={clients}
            onClose={() => { setShowModal(false); setEditTask(null) }}
            onSubmit={(data) => {
              if (editTask) updateMutation.mutate({ id: editTask.id, data })
              else createMutation.mutate(data)
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TaskGroup({ title, tasks, clients, onEdit, onDelete, onComplete, onTestReminder }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task, i) => {
          const client = clients.find((c) => c.id === task.client_id) || task.clients
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 group transition-all ${task.status === 'completed' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => task.status !== 'completed' && onComplete(task)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : 'border-slate-600 hover:border-brand-400'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 size={12} className="text-white m-auto" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-lg priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg status-${task.status}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {client && (
                    <p className="text-xs text-brand-400 mb-1">
                      👤 {client.client_name || client}
                    </p>
                  )}

                  {task.description && (
                    <p className="text-xs text-slate-400 truncate mb-1">{task.description}</p>
                  )}

                  {task.reminder_date && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Bell size={11} />
                      {format(new Date(task.reminder_date), 'MMM d, yyyy')}
                      {task.reminder_time && ` at ${task.reminder_time}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onTestReminder(task)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                    title="Test Reminder"
                  >
                    <Bell size={14} />
                  </button>
                  <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(task)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function TaskModal({ task, clients, onClose, onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: task || { priority: 'medium', status: 'pending' },
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-display text-white">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Task Title *</label>
            <input className={`input-field ${errors.title ? 'border-red-500/50' : ''}`}
              placeholder="Website Design Pending"
              {...register('title', { required: true })} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Client</label>
            <select className="input-field" {...register('client_id')}>
              <option value="">Select client (optional)</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.client_name} - {c.company_name || 'Individual'}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea className="input-field resize-none h-20"
              placeholder="Task details..." {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Reminder Date</label>
              <input type="date" className="input-field" {...register('reminder_date')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Reminder Time</label>
              <input type="time" className="input-field" {...register('reminder_time')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
              <select className="input-field" {...register('priority')}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
              <select className="input-field" {...register('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <p className="text-xs text-brand-400">
              🔔 When reminder time is reached, you'll receive a browser notification, sound alert, and in-app popup.
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

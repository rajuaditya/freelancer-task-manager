import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Plus, Search, Filter, Users, Edit2, Trash2, Eye, X, Loader2,
  Building2, Phone, Mail, Calendar, Tag, FileText, DollarSign,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { clientsApi } from '../lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const PROJECT_TYPES = ['Website Development', 'Mobile App', 'SEO', 'Social Media Marketing', 'Graphic Design', 'Content Writing', 'E-commerce', 'Digital Marketing', 'Logo Design', 'Other']
const STATUSES = ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']
const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export default function ClientsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => clientsApi.getAll(user.id),
    enabled: !!user,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['clients'] })

  const createMutation = useMutation({
    mutationFn: (data) => clientsApi.create({ ...data, user_id: user.id }),
    onSuccess: () => { invalidate(); setShowModal(false); toast.success('Client added successfully!') },
    onError: (e) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => clientsApi.update(id, data, user.id),
    onSuccess: () => { invalidate(); setEditClient(null); toast.success('Client updated!') },
    onError: (e) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, name }) => clientsApi.delete(id, user.id, name),
    onSuccess: () => { invalidate(); setDeleteConfirm(null); toast.success('Client deleted') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = clients.filter((c) => {
    const matchSearch = !search ||
      c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.project_status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Users size={24} className="text-brand-400" /> Client Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search clients, projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="glass-card h-52 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Users size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No clients found</h3>
          <p className="text-slate-400 text-sm mb-4">
            {search ? 'Try a different search term' : 'Add your first client to get started'}
          </p>
          {!search && (
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
              <Plus size={16} /> Add First Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: client.avatar_color || '#6366f1' }}
                    >
                      {client.client_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{client.client_name}</h3>
                      <p className="text-xs text-slate-400">{client.company_name || 'Individual'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium status-${client.project_status}`}>
                    {client.project_status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {client.project_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Tag size={12} className="text-brand-400 flex-shrink-0" />
                      <span className="truncate font-medium text-slate-300">{client.project_name}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Mail size={12} className="flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.mobile && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone size={12} className="flex-shrink-0" />
                      <span>{client.mobile}</span>
                    </div>
                  )}
                  {client.deadline_date && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar size={12} className="flex-shrink-0 text-yellow-400" />
                      <span>Deadline: {format(new Date(client.deadline_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {client.budget && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <DollarSign size={12} className="flex-shrink-0 text-green-400" />
                      <span>₹{Number(client.budget).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {client.project_type && (
                  <div className="mb-4">
                    <span className="text-xs px-2 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {client.project_type}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <Link to={`/clients/${client.id}`} className="flex-1 btn-secondary text-xs py-1.5 justify-center">
                    <Eye size={13} /> View
                  </Link>
                  <button onClick={() => setEditClient(client)} className="flex-1 btn-secondary text-xs py-1.5 justify-center">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(client)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showModal || editClient) && (
          <ClientModal
            client={editClient}
            onClose={() => { setShowModal(false); setEditClient(null) }}
            onSubmit={(data) => {
              const color = data.avatar_color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
              if (editClient) {
                updateMutation.mutate({ id: editClient.id, data: { ...data, avatar_color: color } })
              } else {
                createMutation.mutate({ ...data, avatar_color: color })
              }
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteModal
            name={deleteConfirm.client_name}
            onConfirm={() => deleteMutation.mutate({ id: deleteConfirm.id, name: deleteConfirm.client_name })}
            onClose={() => setDeleteConfirm(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ClientModal({ client, onClose, onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: client || { project_status: 'pending' },
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
        className="w-full max-w-2xl glass-card p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-display text-white">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Client Name *</label>
              <input className={`input-field ${errors.client_name ? 'border-red-500/50' : ''}`}
                placeholder="John Smith"
                {...register('client_name', { required: true })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name</label>
              <input className="input-field" placeholder="Acme Inc." {...register('company_name')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Mobile Number</label>
              <input className="input-field" placeholder="+91 98765 43210" {...register('mobile')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="client@example.com" {...register('email')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Name</label>
              <input className="input-field" placeholder="Website Redesign" {...register('project_name')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Type</label>
              <select className="input-field" {...register('project_type')}>
                <option value="">Select type</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
              <input type="date" className="input-field" {...register('start_date')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Deadline Date</label>
              <input type="date" className="input-field" {...register('deadline_date')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Status</label>
              <select className="input-field" {...register('project_status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Budget (₹)</label>
              <input type="number" className="input-field" placeholder="50000" {...register('budget')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Description</label>
            <textarea className="input-field resize-none h-20" placeholder="Describe the project scope..." {...register('project_description')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
            <textarea className="input-field resize-none h-16" placeholder="Any additional notes..." {...register('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function DeleteModal({ name, onConfirm, onClose, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="glass-card p-6 w-full max-w-sm"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-400" />
        </div>
        <h3 className="text-white font-bold text-center text-lg mb-2">Delete Client?</h3>
        <p className="text-slate-400 text-sm text-center mb-6">
          Are you sure you want to delete <strong className="text-white">{name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn-danger flex-1 justify-center">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, Tag, FileText,
  Clock, CheckCircle2, Edit2, Trash2, DollarSign, MapPin,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { clientsApi } from '../lib/api'
import { format } from 'date-fns'

export default function ClientProfilePage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  })

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-8 w-32 skeleton rounded-xl" />
      <div className="glass-card h-48 skeleton" />
    </div>
  )

  if (!client) return (
    <div className="glass-card p-16 text-center">
      <p className="text-slate-400">Client not found</p>
      <Link to="/clients" className="btn-primary mt-4 mx-auto">Back to Clients</Link>
    </div>
  )

  const tasks = client.tasks || []
  const completedTasks = tasks.filter((t) => t.status === 'completed').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-white">Client Profile</h1>
          <p className="text-slate-400 text-sm">Detailed view</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ background: client.avatar_color || '#6366f1' }}>
            {client.client_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold font-display text-white">{client.client_name}</h2>
              <span className={`text-sm px-3 py-1 rounded-full font-medium status-${client.project_status}`}>
                {client.project_status?.replace('_', ' ')}
              </span>
            </div>
            {client.company_name && (
              <p className="text-slate-400 flex items-center gap-1.5">
                <Building2 size={14} /> {client.company_name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/clients`} state={{ edit: client }} className="btn-secondary py-2">
              <Edit2 size={15} /> Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 font-display">Contact Information</h3>
          <div className="space-y-3">
            {client.email && (
              <InfoRow icon={Mail} label="Email" value={client.email} href={`mailto:${client.email}`} />
            )}
            {client.mobile && (
              <InfoRow icon={Phone} label="Mobile" value={client.mobile} href={`tel:${client.mobile}`} />
            )}
          </div>
        </div>

        {/* Project Info */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-white mb-4 font-display">Project Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {client.project_name && <InfoRow icon={Tag} label="Project" value={client.project_name} />}
            {client.project_type && <InfoRow icon={FileText} label="Type" value={client.project_type} />}
            {client.start_date && <InfoRow icon={Calendar} label="Start Date" value={format(new Date(client.start_date), 'MMM d, yyyy')} />}
            {client.deadline_date && <InfoRow icon={Clock} label="Deadline" value={format(new Date(client.deadline_date), 'MMM d, yyyy')} />}
            {client.budget && <InfoRow icon={DollarSign} label="Budget" value={`₹${Number(client.budget).toLocaleString('en-IN')}`} />}
          </div>

          {client.project_description && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-2">Description</p>
              <p className="text-sm text-slate-300">{client.project_description}</p>
            </div>
          )}

          {client.notes && (
            <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs text-yellow-400 mb-1">📝 Notes</p>
              <p className="text-sm text-slate-300">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white font-display">Tasks ({tasks.length})</h3>
            <span className="text-xs text-slate-400">{completedTasks}/{tasks.length} completed</span>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <CheckCircle2 size={16} className={task.status === 'completed' ? 'text-green-400' : 'text-slate-600'} />
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{task.title}</p>
                  {task.reminder_date && (
                    <p className="text-xs text-slate-500">{format(new Date(task.reminder_date), 'MMM d')} at {task.reminder_time}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-lg priority-${task.priority}`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-brand-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 font-medium">{value}</p>
      </div>
    </div>
  )
  return href ? <a href={href} className="hover:opacity-80 transition-opacity">{content}</a> : content
}

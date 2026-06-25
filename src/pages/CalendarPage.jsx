import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useAuthStore } from '../store/authStore'
import { tasksApi, clientsApi } from '../lib/api'
import { Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
})

export default function CalendarPage() {
  const { user } = useAuthStore()
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState('month')
  const [selected, setSelected] = useState(null)

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => tasksApi.getAll(user.id),
    enabled: !!user,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => clientsApi.getAll(user.id),
    enabled: !!user,
  })

  const events = useMemo(() => {
    const taskEvents = tasks
      .filter((t) => t.reminder_date)
      .map((t) => ({
        id: t.id,
        title: `📌 ${t.title}`,
        start: new Date(`${t.reminder_date}T${t.reminder_time || '09:00'}`),
        end: new Date(`${t.reminder_date}T${t.reminder_time || '09:00'}`),
        resource: { type: 'task', data: t },
        allDay: !t.reminder_time,
      }))

    const deadlineEvents = clients
      .filter((c) => c.deadline_date && c.project_status !== 'completed')
      .map((c) => ({
        id: `dl-${c.id}`,
        title: `⚠️ ${c.client_name}: ${c.project_name || 'Project'}`,
        start: new Date(c.deadline_date),
        end: new Date(c.deadline_date),
        resource: { type: 'deadline', data: c },
        allDay: true,
      }))

    return [...taskEvents, ...deadlineEvents]
  }, [tasks, clients])

  const eventStyleGetter = (event) => {
    const isDeadline = event.resource?.type === 'deadline'
    return {
      style: {
        background: isDeadline
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        padding: '2px 6px',
        color: 'white',
        fontWeight: 500,
      },
    }
  }

  const today = new Date()
  const todayTasks = tasks.filter((t) => t.reminder_date === format(today, 'yyyy-MM-dd') && t.status !== 'completed')
  const upcomingDeadlines = clients.filter((c) => {
    if (!c.deadline_date) return false
    const dl = new Date(c.deadline_date)
    const diff = (dl - today) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7 && c.project_status !== 'completed'
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <CalendarIcon size={24} className="text-brand-400" /> Calendar
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">View tasks and deadlines in calendar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white font-display mb-3 flex items-center gap-2">
              <Clock size={14} className="text-brand-400" /> Today's Tasks
            </h3>
            {todayTasks.length === 0 ? (
              <p className="text-slate-500 text-xs">No tasks today 🎉</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((t) => (
                  <div key={t.id} className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
                    <p className="text-xs font-medium text-white truncate">{t.title}</p>
                    {t.reminder_time && <p className="text-xs text-slate-500">{t.reminder_time}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white font-display mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-yellow-400" /> Upcoming Deadlines
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-slate-500 text-xs">No deadlines this week</p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((c) => (
                  <div key={c.id} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs font-medium text-white truncate">{c.client_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.project_name}</p>
                    <p className="text-[11px] text-red-400">{format(new Date(c.deadline_date), 'MMM d')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white font-display mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <span className="text-xs text-slate-400">Task Reminder</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-400">Project Deadline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 lg:col-span-3"
          style={{ height: 600 }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={date}
            view={view}
            onNavigate={setDate}
            onView={setView}
            onSelectEvent={(event) => setSelected(event)}
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%' }}
            popup
          />
        </motion.div>
      </div>

      {/* Event Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="glass-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white font-display mb-3">{selected.title}</h3>
            {selected.resource?.type === 'task' && (
              <div className="space-y-2 text-sm text-slate-300">
                <p><span className="text-slate-500">Priority:</span> {selected.resource.data.priority}</p>
                <p><span className="text-slate-500">Status:</span> {selected.resource.data.status}</p>
                {selected.resource.data.description && (
                  <p><span className="text-slate-500">Note:</span> {selected.resource.data.description}</p>
                )}
              </div>
            )}
            {selected.resource?.type === 'deadline' && (
              <div className="space-y-2 text-sm text-slate-300">
                <p><span className="text-slate-500">Client:</span> {selected.resource.data.client_name}</p>
                <p><span className="text-slate-500">Project:</span> {selected.resource.data.project_name}</p>
                <p><span className="text-slate-500">Status:</span> {selected.resource.data.project_status}</p>
              </div>
            )}
            <button onClick={() => setSelected(null)} className="btn-secondary mt-4 w-full justify-center">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

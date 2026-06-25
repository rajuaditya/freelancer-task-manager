import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users, FolderOpen, Clock, CheckCircle2, AlertTriangle,
  TrendingUp, Activity, ChevronRight, Calendar, Plus,
  Briefcase, Target, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuthStore } from '../store/authStore'
import { getDashboardStats } from '../lib/api'
import { checkReminders } from '../utils/notifications'
import { format, isToday, isPast } from 'date-fns'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const STATUS_LABELS = {
  pending: 'Pending', in_progress: 'In Progress',
  completed: 'Completed', on_hold: 'On Hold', cancelled: 'Cancelled',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => getDashboardStats(user.id),
    refetchInterval: 60000,
    enabled: !!user,
  })

  // Check reminders every 30s
  useEffect(() => {
    if (!stats) return
    const interval = setInterval(() => {
      checkReminders(stats.tasks || [], stats.clients || [])
    }, 30000)
    checkReminders(stats.tasks || [], stats.clients || [])
    return () => clearInterval(interval)
  }, [stats])

  const statCards = [
    { label: 'Total Clients', value: stats?.totalClients ?? 0, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', link: '/clients' },
    { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: FolderOpen, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', link: '/clients' },
    { label: 'Pending Projects', value: stats?.pendingProjects ?? 0, icon: Clock, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/10', link: '/clients' },
    { label: 'Completed', value: stats?.completedProjects ?? 0, icon: CheckCircle2, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', link: '/clients' },
    { label: "Today's Tasks", value: stats?.todayTasks ?? 0, icon: Target, color: 'from-brand-500 to-violet-500', bg: 'bg-brand-500/10', link: '/tasks' },
    { label: 'Upcoming Deadlines', value: stats?.upcomingDeadlines ?? 0, icon: AlertTriangle, color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', link: '/calendar' },
  ]

  // Build chart data
  const statusData = Object.entries(
    (stats?.clients || []).reduce((acc, c) => {
      acc[c.project_status] = (acc[c.project_status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value }))

  const monthlyData = buildMonthlyData(stats?.clients || [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            Good {getGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's your overview
          </p>
        </div>
        <Link to="/clients" className="btn-primary hidden sm:flex">
          <Plus size={16} /> New Client
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Link to={card.link}>
              <div className="glass-card p-4 card-hover cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon size={20} className={`bg-gradient-to-br ${card.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                </div>
                <p className="text-2xl font-bold font-display text-white group-hover:text-brand-400 transition-colors">
                  {card.value}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{card.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white font-display">Project Activity</h3>
              <p className="text-xs text-slate-400">Clients added per month</p>
            </div>
            <TrendingUp size={16} className="text-brand-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="clients" stroke="#6366f1" strokeWidth={2} fill="url(#colorClients)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white font-display">Status Split</h3>
              <p className="text-xs text-slate-400">Project distribution</p>
            </div>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#f1f5f9' }} />
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white font-display flex items-center gap-2">
              <Calendar size={16} className="text-brand-400" /> Upcoming Deadlines
            </h3>
            <Link to="/calendar" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(stats?.clients || [])
              .filter((c) => c.deadline_date && c.project_status !== 'completed')
              .sort((a, b) => new Date(a.deadline_date) - new Date(b.deadline_date))
              .slice(0, 5)
              .map((client) => {
                const deadline = new Date(client.deadline_date)
                const overdue = isPast(deadline) && !isToday(deadline)
                return (
                  <Link key={client.id} to={`/clients/${client.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: client.avatar_color || '#6366f1' }}>
                      {client.client_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{client.client_name}</p>
                      <p className="text-xs text-slate-500 truncate">{client.project_name}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0 ${overdue ? 'text-red-400 bg-red-500/10' : 'text-brand-400 bg-brand-500/10'}`}>
                      {overdue ? '⚠️ Overdue' : format(deadline, 'MMM d')}
                    </span>
                  </Link>
                )
              })}
            {!(stats?.clients || []).filter((c) => c.deadline_date).length && (
              <EmptyState icon={Calendar} text="No upcoming deadlines" />
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white font-display flex items-center gap-2">
              <Activity size={16} className="text-brand-400" /> Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {(stats?.activityLogs || []).slice(0, 6).map((log, i) => (
              <div key={log.id || i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  log.action === 'created' ? 'bg-green-500/20' :
                  log.action === 'completed' ? 'bg-blue-500/20' :
                  log.action === 'deleted' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}>
                  {log.action === 'created' && <Plus size={12} className="text-green-400" />}
                  {log.action === 'completed' && <CheckCircle2 size={12} className="text-blue-400" />}
                  {log.action === 'updated' && <Zap size={12} className="text-yellow-400" />}
                  {log.action === 'deleted' && <AlertTriangle size={12} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{log.description}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{format(new Date(log.created_at), 'MMM d, h:mm a')}</p>
                </div>
              </div>
            ))}
            {!(stats?.activityLogs || []).length && (
              <EmptyState icon={Activity} text="No recent activity" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="py-8 text-center">
      <Icon size={32} className="text-slate-600 mx-auto mb-2" />
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-[200px] flex items-center justify-center">
      <div className="text-center">
        <FolderOpen size={32} className="text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-xs">Add clients to see stats</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-8 w-64 skeleton rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="glass-card p-4 h-28 skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 h-72 skeleton lg:col-span-2" />
        <div className="glass-card p-5 h-72 skeleton" />
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function buildMonthlyData(clients) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const counts = Array(12).fill(0)
  clients.forEach((c) => {
    if (c.created_at) {
      const month = new Date(c.created_at).getMonth()
      counts[month]++
    }
  })
  return months.map((m, i) => ({ month: m, clients: counts[i] }))
}

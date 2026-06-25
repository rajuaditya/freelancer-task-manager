import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3, Download, FileText, TrendingUp, Users,
  CheckCircle2, Clock, DollarSign, FileDown,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { useAuthStore } from '../store/authStore'
import { clientsApi, tasksApi } from '../lib/api'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function ReportsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')

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

  // Compute stats
  const totalRevenue = clients.reduce((sum, c) => sum + (Number(c.budget) || 0), 0)
  const completedRevenue = clients
    .filter((c) => c.project_status === 'completed')
    .reduce((sum, c) => sum + (Number(c.budget) || 0), 0)

  const statusData = ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'].map((s) => ({
    name: s.replace('_', ' '),
    value: clients.filter((c) => c.project_status === s).length,
  })).filter((d) => d.value > 0)

  const typeData = Object.entries(
    clients.reduce((acc, c) => {
      if (c.project_type) acc[c.project_type] = (acc[c.project_type] || 0) + 1
      return acc
    }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8)

  // Monthly revenue
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  })
  const monthlyRevenue = last6Months.map((month) => {
    const monthClients = clients.filter((c) => {
      const d = new Date(c.created_at)
      return d >= startOfMonth(month) && d <= endOfMonth(month)
    })
    return {
      month: format(month, 'MMM'),
      revenue: monthClients.reduce((sum, c) => sum + (Number(c.budget) || 0), 0),
      clients: monthClients.length,
    }
  })

  // Client-wise table
  const clientReports = clients.map((c) => ({
    ...c,
    taskCount: tasks.filter((t) => t.client_id === c.id).length,
    completedTasks: tasks.filter((t) => t.client_id === c.id && t.status === 'completed').length,
  }))

  const exportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF()

      doc.setFontSize(20)
      doc.setTextColor(99, 102, 241)
      doc.text('Freelancer Task Manager Pro', 14, 20)
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text(`Report Generated: ${format(new Date(), 'PPP')}`, 14, 30)

      // Summary
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Summary', 14, 45)
      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Clients', clients.length],
          ['Total Revenue', `₹${totalRevenue.toLocaleString('en-IN')}`],
          ['Completed Projects', clients.filter((c) => c.project_status === 'completed').length],
          ['Pending Projects', clients.filter((c) => c.project_status === 'pending').length],
          ['Total Tasks', tasks.length],
          ['Completed Tasks', tasks.filter((t) => t.status === 'completed').length],
        ],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      })

      // Client Table
      doc.addPage()
      doc.setFontSize(14)
      doc.text('Client Report', 14, 20)
      autoTable(doc, {
        startY: 25,
        head: [['Client', 'Company', 'Project', 'Status', 'Budget', 'Deadline']],
        body: clients.map((c) => [
          c.client_name,
          c.company_name || '-',
          c.project_name || '-',
          c.project_status?.replace('_', ' ') || '-',
          c.budget ? `₹${Number(c.budget).toLocaleString('en-IN')}` : '-',
          c.deadline_date ? format(new Date(c.deadline_date), 'dd/MM/yyyy') : '-',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 },
      })

      doc.save(`FTM-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast.success('PDF exported successfully!')
    } catch (e) {
      toast.error('PDF export failed: ' + e.message)
    }
  }

  const exportExcel = async () => {
    try {
      const { utils, writeFile } = await import('xlsx')
      const wb = utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Clients', clients.length],
        ['Total Revenue', totalRevenue],
        ['Completed Revenue', completedRevenue],
        ['Completed Projects', clients.filter((c) => c.project_status === 'completed').length],
        ['Pending Projects', clients.filter((c) => c.project_status === 'pending').length],
        ['Total Tasks', tasks.length],
      ]
      utils.book_append_sheet(wb, utils.aoa_to_sheet(summaryData), 'Summary')

      // Clients sheet
      const clientData = [
        ['Client Name', 'Company', 'Email', 'Mobile', 'Project', 'Type', 'Status', 'Budget', 'Start Date', 'Deadline'],
        ...clients.map((c) => [
          c.client_name, c.company_name, c.email, c.mobile,
          c.project_name, c.project_type, c.project_status,
          c.budget, c.start_date, c.deadline_date,
        ]),
      ]
      utils.book_append_sheet(wb, utils.aoa_to_sheet(clientData), 'Clients')

      // Tasks sheet
      const taskData = [
        ['Title', 'Client', 'Priority', 'Status', 'Reminder Date', 'Reminder Time'],
        ...tasks.map((t) => [
          t.title,
          t.clients?.client_name || '',
          t.priority, t.status,
          t.reminder_date, t.reminder_time,
        ]),
      ]
      utils.book_append_sheet(wb, utils.aoa_to_sheet(taskData), 'Tasks')

      writeFile(wb, `FTM-Report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
      toast.success('Excel exported successfully!')
    } catch (e) {
      toast.error('Excel export failed: ' + e.message)
    }
  }

  const tabs = ['overview', 'clients', 'revenue', 'tasks']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-brand-400" /> Reports & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Insights into your freelance business</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn-secondary py-2 text-sm">
            <FileDown size={15} /> PDF
          </button>
          <button onClick={exportExcel} className="btn-primary py-2 text-sm">
            <Download size={15} /> Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Earned', value: `₹${completedRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: clients.filter((c) => c.project_status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass-card p-4 ${stat.bg}`}>
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <p className={`text-xl font-bold font-display ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-card w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white font-display mb-4">Project Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white font-display mb-4">Projects by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} width={110} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white font-display mb-4">Monthly Revenue & Clients (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#f1f5f9' }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="clients" name="New Clients" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-semibold text-white font-display">Client-wise Report</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Client', 'Company', 'Project Type', 'Status', 'Budget', 'Tasks', 'Deadline'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientReports.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: c.avatar_color || '#6366f1' }}>
                          {c.client_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-white font-medium">{c.client_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{c.company_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{c.project_type || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg status-${c.project_status}`}>
                        {c.project_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-green-400 font-mono">
                      {c.budget ? `₹${Number(c.budget).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {c.completedTasks}/{c.taskCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {c.deadline_date ? format(new Date(c.deadline_date), 'dd/MM/yy') : '-'}
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No clients to report</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-semibold text-white font-display">Task Report</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Task', 'Client', 'Priority', 'Status', 'Reminder Date', 'Time'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium max-w-[200px] truncate">{t.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{t.clients?.client_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-lg priority-${t.priority}`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-lg status-${t.status}`}>{t.status?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {t.reminder_date ? format(new Date(t.reminder_date), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{t.reminder_time || '-'}</td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No tasks to report</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

import { motion } from 'framer-motion'
import { Bell, Check, CheckCheck, Trash2, Clock } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { formatNotifTime } from '../utils/notifications'

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, clearNotifications, unreadCount } = useAppStore()

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Bell size={24} className="text-brand-400" /> Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {unreadCount} unread · {notifications.length} total
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary py-2 text-sm">
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearNotifications} className="btn-danger py-2 text-sm">
              <Trash2 size={15} /> Clear All
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Bell size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">All caught up!</h3>
          <p className="text-slate-400 text-sm">No notifications yet. Task reminders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 cursor-pointer transition-all hover:border-brand-500/30 ${
                !notif.read ? 'border-brand-500/30 bg-brand-500/5' : ''
              }`}
              onClick={() => markRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.type === 'reminder' ? 'bg-yellow-500/20' :
                  notif.type === 'deadline' ? 'bg-red-500/20' : 'bg-brand-500/20'
                }`}>
                  {notif.type === 'reminder' ? '⚠️' : notif.type === 'deadline' ? '📅' : '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{notif.title}</p>
                  {notif.clientName && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="text-slate-500">Client:</span> {notif.clientName}
                    </p>
                  )}
                  {notif.taskTitle && (
                    <p className="text-xs text-slate-400">
                      <span className="text-slate-500">Task:</span> {notif.taskTitle}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1">
                    <Clock size={10} />
                    {formatNotifTime(notif.timestamp)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {!notif.read ? (
                    <div className="w-2 h-2 rounded-full bg-brand-400" />
                  ) : (
                    <Check size={14} className="text-slate-600" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

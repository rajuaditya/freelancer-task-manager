import { useAppStore } from '../store/appStore'

// Request browser notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// Register service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch (err) {
    console.warn('SW registration failed:', err)
    return null
  }
}

// Show browser notification
export function showBrowserNotification(title, options = {}) {
  if (Notification.permission !== 'granted') return
  const notification = new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    requireInteraction: true,
    ...options,
  })
  notification.onclick = () => {
    window.focus()
    notification.close()
  }
  return notification
}

// Play notification sound
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  } catch (e) {
    console.warn('Audio playback failed:', e)
  }
}

// Full notification trigger
export function triggerReminder(task, clientName) {
  const title = '⚠️ Reminder Alert'
  const body = `Client: ${clientName}\nTask: ${task.title}`

  // 1. Browser notification
  showBrowserNotification(title, {
    body,
    tag: `task-${task.id}`,
    data: { url: '/tasks' },
  })

  // 2. Sound
  playNotificationSound()

  // 3. In-app popup
  useAppStore.getState().addNotification({
    title,
    clientName,
    taskTitle: task.title,
    message: body,
    type: 'reminder',
    taskId: task.id,
  })
}

// Check tasks for due reminders (called on interval)
export function checkReminders(tasks, clients) {
  const now = new Date()
  tasks.forEach((task) => {
    if (!task.reminder_date || !task.reminder_time || task.status === 'completed' || task.is_notified) return
    const reminderDateTime = new Date(`${task.reminder_date}T${task.reminder_time}`)
    const diff = reminderDateTime - now
    if (diff >= 0 && diff <= 60000) { // Within 1 minute window
      const client = clients?.find((c) => c.id === task.client_id)
      triggerReminder(task, client?.client_name || 'Unknown Client')
    }
  })
}

// Format notification time
export function formatNotifTime(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}
